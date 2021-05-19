import AdmZip from 'adm-zip';
import fs from 'fs';
import * as Path from 'path';
import {
  BrowserWindow,
  dialog,
  ipcMain,
  IpcMainEvent,
  WebContents,
} from 'electron';
import { normalize } from 'normalizr';
import Correction from './model/Correction';
import Parser, { ParserType } from './parser/Parser';
import instanciateParser from './parser/ParserUtil';
import {
  IMPORT_CONFLICTS,
  IMPORT_FAILED,
  IMPORT_PROGRESS,
  IMPORT_START,
  IMPORT_SUCCESSFUL,
} from './constants/ImportIPC';
import {
  addFileToWorkspace,
  createDirectoryInWorkspace,
  createNewCorFile,
  existsInWorkspace,
  getAllFilesInDirectory,
} from './utils/FileAccess';
import { CorrectionSchema } from './model/NormalizationSchema';

export interface ImportProgress {
  name: string;
  index: number;
  total: number;
}

export type CorrectionImportRequest = {
  path: string;
  parser: ParserType;
};

export type ImportConflicts = {
  files: CorrectionImportRequest[];
  zipPath?: string;
};

export default class Importer {
  private mainWindow: BrowserWindow;

  private index = 0;

  private total = 0;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    ipcMain.on(IMPORT_START, (event: IpcMainEvent, arg) => {
      const { sender } = event;
      this.importCorrections(arg.path, arg.workspace, arg.parserType, sender);
    });

    ipcMain.on(IMPORT_CONFLICTS, (event: IpcMainEvent, arg) => {
      const { sender } = event;
      this.overwriteConflictedCorrections(arg.workspace, arg.conflicts, sender);
    });
  }

  public importCorrections = (
    path: string,
    workspacePath: string,
    parserType: ParserType,
    sender: WebContents
  ) => {
    const parser: Parser = instanciateParser(parserType);
    let workspace = workspacePath;

    // Create new workspace file if no workspace is allocated yet
    if (workspacePath.length === 0) {
      const p: string | undefined = dialog.showSaveDialogSync(this.mainWindow, {
        filters: [{ name: 'Correctinator', extensions: ['cor'] }],
      });
      if (!p) {
        sender.send(
          IMPORT_FAILED,
          new Error('Cannot create new workspace file!')
        );
        return;
      }
      createNewCorFile(p);
      // dispatch(workspaceSetPath(p));
      workspace = p;
    }

    // Import from zip file or folder?
    const fileStats = fs.statSync(path);

    let result:
      | undefined
      | {
          corrections: Correction[];
          conflicts: ImportConflicts | undefined;
        };

    if (fileStats.isDirectory()) {
      // Import from folder
      result = this.importCorrectionsFromFolderToWorkspace(
        parser,
        path,
        workspace,
        sender
      );
    }

    if (fileStats.isFile() && Path.parse(path).ext.toLowerCase() === '.zip') {
      // Import from zip
      result = this.importCorrectionsFromZipToWorkspace(
        parser,
        path,
        workspace,
        sender
      );
    }

    if (result) {
      sender.send(IMPORT_SUCCESSFUL, {
        corrections: result.corrections,
        conflicts: result.conflicts,
        newWorkspace: workspacePath === workspace ? undefined : workspace,
      });
    } else {
      sender.send(IMPORT_FAILED, new Error('Something went wrong!'));
    }
  };

  private importCorrectionsFromFolderToWorkspace(
    parser: Parser,
    path: string,
    workspace: string,
    sender: WebContents
  ) {
    // Import directory
    const configFilePaths = getAllFilesInDirectory(path).filter((file) =>
      file.match(parser.configFilePattern)
    );

    this.total = configFilePaths.length;

    const redundantCorrections: CorrectionImportRequest[] = [];
    const corrections: Correction[] = [];

    configFilePaths.forEach((importPath, i) => {
      this.index = i;
      sender.send(IMPORT_PROGRESS, {
        name: Path.basename(importPath),
        index: this.index,
        total: this.total,
      });
      const content = fs.readFileSync(importPath, 'utf8');
      const correction: Correction = parser.deserialize(
        content,
        Path.basename(Path.dirname(importPath))
      );

      // Were the submissions already imported?
      if (existsInWorkspace(correction.submission.name, workspace)) {
        redundantCorrections.push({
          path: importPath,
          parser: parser.getType(),
        });
        return;
      }

      corrections.push(
        this.ingestCorrectionFromFolder(
          correction,
          importPath,
          parser,
          workspace,
          sender
        )
      );
    });

    return {
      corrections,
      conflicts:
        redundantCorrections.length > 0
          ? {
              files: redundantCorrections,
            }
          : undefined,
    };
  }

  private importCorrectionsFromZipToWorkspace(
    parser: Parser,
    path: string,
    workspace: string,
    sender: WebContents
  ) {
    const zip = new AdmZip(path);

    const zipEntryDesc = zip.getEntries();
    const configFiles = zipEntryDesc.filter(
      (entry) =>
        !entry.isDirectory && entry.entryName.match(parser.configFilePattern)
    );
    this.total = configFiles.length;

    const redundantCorrections: CorrectionImportRequest[] = [];
    const corrections: Correction[] = [];

    configFiles.forEach((zipEntry, i) => {
      this.index = i;
      sender.send(IMPORT_PROGRESS, {
        name: Path.basename(zipEntry.entryName),
        index: this.index,
        total: this.total,
      });
      const content = zipEntry.getData().toString('utf8');
      const correction: Correction = parser.deserialize(
        content,
        Path.basename(Path.dirname(zipEntry.entryName))
      );

      // Were the submissions already imported?
      if (existsInWorkspace(correction.submission.name, workspace)) {
        redundantCorrections.push({
          path: zipEntry.entryName,
          parser: parser.getType(),
        });
        return;
      }

      corrections.push(
        this.ingestCorrectionFromZip(
          correction,
          zipEntry.entryName,
          parser,
          zip,
          workspace,
          sender
        )
      );
    });

    return {
      corrections,
      conflicts:
        redundantCorrections.length > 0
          ? {
              files: redundantCorrections,
              zipPath: path,
            }
          : undefined,
    };
  }

  private ingestCorrectionFromFolder(
    correction: Correction,
    path: string,
    parser: Parser,
    workspace: string,
    sender: WebContents
  ) {
    const submissionName = correction.submission.name;

    // Create correction directory in workspace
    createDirectoryInWorkspace(`${submissionName}/`, workspace);

    // Create file folder and copy submission files
    createDirectoryInWorkspace(`${submissionName}/files/`, workspace);

    // This is not really modular, other parsers could use a different folder structure -> need to add new parser method
    const files: string[] = getAllFilesInDirectory(Path.dirname(path)).filter(
      (file) => !file.match(parser.configFilePattern)
    );
    const targetFiles = this.copySubmissionFiles(
      files,
      submissionName,
      workspace,
      sender
    );

    correction.submission.files = targetFiles.map((f) => {
      return { path: Path.parse(f).base, unread: true };
    });

    // Save config file
    const { entities } = normalize(correction, CorrectionSchema);
    addFileToWorkspace(
      `${submissionName}/config.json`,
      Buffer.from(JSON.stringify(entities), 'utf8'),
      workspace
    );

    return correction;
  }

  private ingestCorrectionFromZip(
    correction: Correction,
    path: string,
    parser: Parser,
    zip: AdmZip,
    workspace: string,
    sender: WebContents
  ) {
    const submissionName = correction.submission.name;

    // Create correction directory in workspace
    createDirectoryInWorkspace(`${submissionName}/`, workspace);
    const zipEntries = zip.getEntries();
    const files: string[] = zipEntries
      .filter(
        (entry) =>
          !entry.isDirectory &&
          !entry.entryName.match(parser.configFilePattern) &&
          entry.entryName.includes(Path.dirname(path))
      )
      .map((entry) => entry.entryName);

    createDirectoryInWorkspace(`${submissionName}/files/`, workspace);
    const targetFiles: string[] = [];
    files.forEach((file) => {
      sender.send(IMPORT_PROGRESS, {
        name: Path.basename(file),
        index: this.index,
        total: this.total,
      });
      const filesDir: string = Path.join(submissionName, 'files');
      const { base } = Path.parse(file);
      const fileName = base;
      const buffer: Buffer | null = zip.readFile(file);
      if (buffer != null) {
        addFileToWorkspace(`${filesDir}/${fileName}`, buffer, workspace);
        targetFiles.push(`${filesDir}/${fileName}`);
      }
    });

    correction.submission.files = targetFiles.map((f) => {
      return { path: Path.parse(f).base, unread: true };
    });

    // Save config file
    const { entities } = normalize(correction, CorrectionSchema);
    addFileToWorkspace(
      `${submissionName}/config.json`,
      Buffer.from(JSON.stringify(entities), 'utf8'),
      workspace
    );

    return correction;
  }

  public overwriteConflictedCorrections(
    workspace: string,
    importConflicts: ImportConflicts,
    sender: WebContents
  ) {
    const corrections: Correction[] = [];
    this.total = importConflicts.files.length;

    if (importConflicts?.zipPath) {
      // Import from zip
      const zip = new AdmZip(importConflicts.zipPath);
      importConflicts.files.forEach((c, i) => {
        this.index = i;
        sender.send(IMPORT_PROGRESS, {
          name: Path.basename(c.path),
          index: this.index,
          total: this.total,
        });
        const zipEntry = zip.getEntry(c.path);
        const content = zipEntry.getData().toString('utf8');
        const parser: Parser = instanciateParser(c.parser);
        const correction: Correction = parser.deserialize(
          content,
          Path.basename(Path.dirname(c.path))
        );
        corrections.push(
          this.ingestCorrectionFromZip(
            correction,
            c.path,
            parser,
            zip,
            workspace,
            sender
          )
        );
      });
    } else {
      // Import from folder
      importConflicts.files.forEach((c, i) => {
        this.index = i;
        sender.send(IMPORT_PROGRESS, {
          name: Path.basename(c.path),
          index: this.index,
          total: this.total,
        });
        const content = fs.readFileSync(c.path, 'utf8');
        const parser: Parser = instanciateParser(c.parser);
        const correction: Correction = parser.deserialize(
          content,
          Path.basename(Path.dirname(c.path))
        );
        corrections.push(
          this.ingestCorrectionFromFolder(
            correction,
            c.path,
            parser,
            workspace,
            sender
          )
        );
      });
    }

    sender.send(IMPORT_SUCCESSFUL, {
      corrections,
      conflicts: undefined,
      newWorkspace: undefined,
    });
  }

  private copySubmissionFiles(
    files: string[],
    submissionId: string | undefined = undefined,
    workspace: string,
    sender: WebContents
  ): string[] {
    const zip = new AdmZip(workspace);
    const targetFiles: string[] = [];
    files.forEach((file) => {
      sender.send(IMPORT_PROGRESS, {
        name: Path.basename(file),
        index: this.index,
        total: this.total,
      });
      const { base } = Path.parse(file);
      if (submissionId) {
        const fileName = base;
        const fileDir = `${submissionId}/files/`;
        const fullPath = `${fileDir}/${fileName}`;
        if (zip.getEntry(fullPath) === null) {
          zip.addLocalFile(file, fileDir, fileName);
        } else {
          zip.deleteFile(fullPath);
          zip.addLocalFile(file, fileDir, fileName);
        }
        targetFiles.push(fullPath);
      }
    });
    zip.writeZip();
    return targetFiles;
  }
}
