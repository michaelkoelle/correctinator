import AdmZip from 'adm-zip';
import archiver from 'archiver';
import fs from 'fs';
import * as Path from 'path';
import { app, ipcMain, IpcMainEvent, WebContents } from 'electron';
import {
  EXPORT_FAILED,
  EXPORT_PROGRESS,
  EXPORT_START,
  EXPORT_SUCCESSFUL,
} from './constants/ExportIPC';
import ConditionalComment from './model/ConditionalComment';
import Correction from './model/Correction';
import Parser, { ParserType } from './parser/Parser';
import instanciateParser from './parser/ParserUtil';
import { serializeCorrection } from './utils/Formatter';

export interface ExportProgress {
  steps: {
    name: string;
    files: string[];
  }[];
  stepIndex: number;
  fileIndex: number;
}

export default class Exporter {
  constructor() {
    ipcMain.on(EXPORT_START, (event: IpcMainEvent, arg) => {
      const { sender } = event;
      Exporter.exportCorrections(
        arg.zipPath,
        arg.workspace,
        arg.parser,
        arg.corrections,
        arg.conditionalComments,
        sender
      )
        .then((v) => {
          sender.send(EXPORT_SUCCESSFUL);
          return v;
        })
        .catch((e) => {
          sender.send(EXPORT_FAILED);
        });
    });
  }

  static exportCorrections(
    zipPath: string,
    workspace: string,
    parserType: ParserType,
    corrections: Correction[],
    conditionalComments: ConditionalComment[] = [],
    webContents: WebContents
  ) {
    return new Promise((resolve, reject) => {
      const parser = instanciateParser(parserType);
      const output = fs.createWriteStream(zipPath);
      const steps = [
        {
          name: 'Creating zip archive',
          files: corrections.map((c) => c.submission.name),
        },
        {
          name: 'Verifying files',
          files: corrections.map((c) => parser.getConfigFileName(c)),
        },
      ];

      output.on('close', () => {
        try {
          Exporter.verifyZipContents(
            zipPath,
            corrections,
            parser,
            webContents,
            steps
          );
          resolve(zipPath);
        } catch (e) {
          reject(e);
        }
      });

      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      archive.on('error', (e) => {
        reject(e);
      });

      archive.pipe(output);

      corrections.forEach((c, i) => {
        const progress: ExportProgress = {
          steps,
          stepIndex: 0,
          fileIndex: i,
        };
        webContents.send(EXPORT_PROGRESS, progress);

        const content = parser.serialize(
          c,
          serializeCorrection(c, conditionalComments)
        );

        // Add submission files folder
        Exporter.loadFilesFromWorkspace(c.submission.name, workspace).forEach(
          (f) => {
            const fBuffer = fs.readFileSync(f);
            archive.append(fBuffer, {
              name: Path.join(c.submission.name, 'files', Path.parse(f).base),
            });
          }
        );

        // Add rating file
        archive.append(Buffer.from(content), {
          name: Path.join(c.submission.name, parser.getConfigFileName(c)),
        });
      });

      archive.finalize();
    });
  }

  static exportCorrectionsAlternative(
    zipPath: string,
    workspace: string,
    parser: Parser,
    corrections: Correction[],
    conditionalComments: ConditionalComment[] = []
  ) {
    const zip = new AdmZip();

    corrections.forEach((c) => {
      const content = parser.serialize(
        c,
        serializeCorrection(c, conditionalComments)
      );

      // Add rating file
      zip.addFile(
        Path.join(c.submission.name, parser.getConfigFileName(c)),
        Buffer.from(content, 'utf8')
      );

      // Add submission files folder
      zip.addLocalFolder(
        Path.join(workspace, c.submission.name, 'files'),
        Path.join(c.submission.name, 'files')
      );
    });

    zip.writeZip(zipPath);

    // Verify zip contents
    const zipVal = new AdmZip(zipPath);
    const zipEntries = zipVal.getEntries();

    const validation = corrections
      .map((c) => Path.join(c.submission.name, parser.getConfigFileName(c)))
      .map((path) => {
        let hit = false;
        zipEntries.forEach((entry) => {
          if (entry.entryName === path) {
            hit = true;
          }
        });
        return { path, valid: hit };
      });

    // If not all directories have been found in zip, throw error
    if (validation.filter((v) => !v.valid).length > 0) {
      throw Error('Validation failed!');
    }
  }

  static verifyZipContents = (
    zipPath: string,
    corrections: Correction[],
    parser: Parser,
    webContents: WebContents,
    steps: { name: string; files: string[] }[]
  ) => {
    // Verify zip contents
    const zipVal = new AdmZip(zipPath);
    const zipEntries = zipVal.getEntries();

    const validation = corrections.map((c, i) => {
      const progress: ExportProgress = {
        steps,
        stepIndex: 1,
        fileIndex: i,
      };
      webContents.send(EXPORT_PROGRESS, progress);

      const path = Path.join(c.submission.name, parser.getConfigFileName(c));

      let hit = false;
      zipEntries.forEach((entry) => {
        if (entry.entryName === path.replace('\\', '/')) {
          hit = true;
        }
      });
      return { path, valid: hit };
    });

    // If not all directories have been found in zip, throw error
    if (validation.filter((v) => !v.valid).length > 0) {
      throw Error('Validation failed!');
    }
  };

  static loadFilesFromWorkspace(
    submissionName: string,
    workspace: string
  ): string[] {
    if (!fs.existsSync(workspace) || Path.extname(workspace) !== '.cor') {
      return [];
    }
    const tempPaths: string[] = [];
    const userDataPath: string = app.getPath('userData');
    const tempDir = Path.join(userDataPath, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    Exporter.deleteEverythingInDir(tempDir);

    const zip = new AdmZip(workspace);
    zip
      .getEntries()
      .filter((entry) => {
        return (
          Path.dirname(entry.entryName).replaceAll('\\', '/') ===
          Path.join(submissionName, 'files').replaceAll('\\', '/')
        );
      })
      .forEach((entry) => {
        const path = Path.join(tempDir, entry.name);
        zip.extractEntryTo(entry, tempDir, false, true);
        tempPaths.push(path);
      });
    return tempPaths;
  }

  static deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file) => {
        const curPath = Path.join(path, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          Exporter.deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

  static deleteEverythingInDir(dir: string) {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((file) => {
        const path = Path.join(dir, file);
        if (fs.lstatSync(path).isDirectory()) {
          Exporter.deleteFolderRecursive(path);
        } else {
          fs.unlinkSync(path);
        }
      });
    }
  }
}
