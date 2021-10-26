import AdmZip from 'adm-zip';
import archiver from 'archiver';
import fs from 'fs';
import * as Path from 'path';
import { ipcMain, IpcMainEvent, WebContents } from 'electron';
import {
  EXPORT_FAILED,
  EXPORT_PROGRESS,
  EXPORT_START,
  EXPORT_SUCCESSFUL,
} from './constants/ExportIPC';
import ConditionalComment from './model/ConditionalComment';
import Correction from './model/Correction';
import Parser from './parser/Parser';
import instanciateParser from './parser/ParserUtil';
import { serializeCorrection } from './utils/Formatter';
import { loadFilesFromWorkspaceMainProcess } from './utils/FileAccess';
import ParserType from './parser/ParserType';

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
        arg.valueTypeOverwrite,
        sender
      )
        .then((v) => {
          sender.send(EXPORT_SUCCESSFUL);
          return v;
        })
        .catch((e) => {
          sender.send(EXPORT_FAILED, e);
        });
    });
  }

  static exportCorrections(
    zipPath: string,
    workspace: string,
    parserType: ParserType,
    corrections: Correction[],
    conditionalComments: ConditionalComment[] = [],
    valueTypeOverwrite: string | undefined,
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
          name: 'Finalizing archive',
          files: [Path.basename(zipPath)],
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
          serializeCorrection(c, valueTypeOverwrite, conditionalComments)
        );

        // Add submission files folder
        loadFilesFromWorkspaceMainProcess(c.submission.name, workspace).forEach(
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

      webContents.send(EXPORT_PROGRESS, {
        steps,
        stepIndex: 1,
        fileIndex: 0,
      });
      archive.finalize();
    });
  }

  static exportCorrectionsAlternative(
    zipPath: string,
    workspace: string,
    parser: Parser,
    corrections: Correction[],
    valueTypeOverwrite: string | undefined,
    conditionalComments: ConditionalComment[] = []
  ) {
    const zip = new AdmZip();

    corrections.forEach((c) => {
      const content = parser.serialize(
        c,
        serializeCorrection(c, valueTypeOverwrite, conditionalComments)
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
        stepIndex: 2,
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
}
