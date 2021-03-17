/* eslint-disable import/no-cycle */
import { OpenDialogReturnValue, remote, SaveDialogReturnValue } from 'electron';
import fs from 'fs';
import * as Path from 'path';
import 'setimmediate';
import AdmZip from 'adm-zip';
import archiver from 'archiver';
import { normalize } from 'normalizr';
import { serializeCorrection } from './Formatter';
import Correction from '../model/Correction';
import { CorrectionSchema } from '../model/NormalizationSchema';
import Parser from '../parser/Parser';
import ConditionalComment from '../model/ConditionalComment';
import { deleteEntities, correctionsImport } from '../model/CorrectionsSlice';
import { selectAllCorrectionsDenormalized } from '../model/Selectors';
import {
  selectWorkspacePath,
  workspaceSetPath,
} from '../features/workspace/workspaceSlice';
import { reportSaved } from '../model/SaveSlice';

export function createDirectoryInWorkspace(dir: string, workspace) {
  const zip = new AdmZip(workspace);
  zip.addFile(dir, Buffer.alloc(0));
  zip.writeZip();
}

export async function openDirectory(): Promise<string> {
  const returnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      properties: ['openDirectory'],
    }
  );

  if (returnValue.canceled || returnValue.filePaths.length !== 1) {
    throw new Error('No directory selected');
  }
  const dir: string = returnValue.filePaths[0];
  return dir;
}

export function getAllFilesInDirectory(
  dir: string,
  files_: string[] = []
): string[] {
  if (!fs.existsSync(dir)) {
    return files_;
  }
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const path = Path.normalize(`${dir}/${file}`);
    if (fs.statSync(path).isDirectory() && !path.includes('MACOSX')) {
      getAllFilesInDirectory(path, files_);
    } else if (
      !fs.statSync(path).isDirectory() &&
      !/(^|\/)\.[^\\/\\.]/g.test(path)
    ) {
      files_.push(path);
    }
  });
  return files_;
}

export function copySubmissionFiles(
  files: string[],
  name: string | undefined = undefined,
  workspace: string
) {
  const zip = new AdmZip(workspace);
  files.forEach((file, i) => {
    const { ext } = Path.parse(file);
    if (name) {
      const fileName = `${name}-${i + 1}${ext}`;
      zip.addLocalFile(file, `${name}/files/`, fileName);
    }
  });
  zip.writeZip();
}

export function addFileToWorkspace(
  name: string,
  buffer: Buffer,
  workspace: string
) {
  const zip = new AdmZip(workspace);
  zip.addFile(name, buffer);
  zip.writeZip();
}

export function createNewCorFile(path) {
  const zip = new AdmZip();
  zip.writeZip(path);
}

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = Path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function deleteEverythingInDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const path = Path.join(dir, file);
      if (fs.lstatSync(path).isDirectory()) {
        deleteFolderRecursive(path);
      } else {
        fs.unlinkSync(path);
      }
    });
  }
}

export function getFilesForCorrectionFromWorkspace(
  submissionName: string,
  workspace: string
): string[] {
  if (!fs.existsSync(workspace) || Path.extname(workspace) !== '.cor') {
    return [];
  }
  const tempPaths: string[] = [];
  const userDataPath: string = remote.app.getPath('userData');
  const tempDir = Path.join(userDataPath, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  deleteEverythingInDir(tempDir);

  const zip = new AdmZip(workspace);
  zip
    .getEntries()
    .filter((entry) => {
      return (
        Path.dirname(entry.entryName) === Path.join(submissionName, 'files')
      );
    })
    .forEach((entry) => {
      const path = Path.join(tempDir, entry.name);
      zip.extractEntryTo(entry, tempDir, false, true);
      tempPaths.push(path);
    });
  return tempPaths;
}

export function exportCorrections(
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

function verifyZipContents(zipPath, corrections, parser) {
  // Verify zip contents
  const zipVal = new AdmZip(zipPath);
  const zipEntries = zipVal.getEntries();

  const validation = corrections
    .map((c) => Path.join(c.submission.name, parser.getConfigFileName(c)))
    .map((path) => {
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
}

export function exportCorrections1(
  zipPath: string,
  workspace: string,
  parser: Parser,
  corrections: Correction[],
  conditionalComments: ConditionalComment[] = []
) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);

    output.on('close', () => {
      try {
        verifyZipContents(zipPath, corrections, parser);
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

    corrections.forEach((c) => {
      const content = parser.serialize(
        c,
        serializeCorrection(c, conditionalComments)
      );

      // Add submission files folder
      fs.readdirSync(Path.join(workspace, c.submission.name, 'files')).forEach(
        (f) => {
          const path = Path.join(workspace, c.submission.name, 'files', f);
          const fBuffer = fs.readFileSync(path);
          archive.append(fBuffer, {
            name: Path.join(c.submission.name, 'files', f),
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

export function deleteCorrectionFromWorkspace(
  correction: Correction,
  workspace: string
) {
  const zip = new AdmZip(workspace);
  zip
    .getEntries()
    .filter((entry) => entry.entryName.includes(correction.submission.name))
    .forEach((entry) => zip.deleteFile(entry));
  zip.writeZip();
}

export function existsInWorkspace(name: string, workspace: string): boolean {
  const zip = new AdmZip(workspace);
  const entry = zip.getEntry(`${name}/config.json`);
  return entry !== null;
}

export function reloadState() {
  return (dispatch, getState) => {
    // Delete old entities
    dispatch(deleteEntities());
    // Load from .cor
    const workspace = selectWorkspacePath(getState());
    const zip = new AdmZip(workspace);
    zip
      .getEntries()
      .filter((entry) => Path.parse(entry.entryName).base === 'config.json')
      .forEach((entry) => {
        const entities = JSON.parse(zip.readAsText(entry, 'utf8'));
        dispatch(correctionsImport(entities));
      });
  };
}

export function saveCorrectionToWorkspace(c: Correction, workspace: string) {
  console.log('Save', c.submission.name);
  if (Path.extname(workspace) === '.cor') {
    const zip = new AdmZip(workspace);
    const correctionDir: string = Path.join(
      c.submission.name,
      'config.json'
    ).replaceAll('\\', '/');
    const { entities } = normalize(c, CorrectionSchema);
    zip.updateFile(correctionDir, Buffer.from(JSON.stringify(entities)));
    zip.writeZip();
  }
}

export function saveAllCorrections() {
  console.log('SAVING');
  return (dispatch, getState) => {
    const state = getState();
    const corrections: Correction[] = selectAllCorrectionsDenormalized(state);
    const workspace: string = selectWorkspacePath(state);

    if (Path.extname(workspace) === '.cor' && fs.existsSync(workspace)) {
      const zip = new AdmZip(workspace);
      corrections.forEach((c) => {
        const correctionDir: string = Path.join(
          c.submission.name,
          'config.json'
        ).replaceAll('\\', '/');

        const entry = zip.getEntry(correctionDir);
        const { entities } = normalize(c, CorrectionSchema);
        if (!entry) {
          zip.addFile(correctionDir, Buffer.from(JSON.stringify(entities)));
        } else {
          zip.updateFile(entry, Buffer.from(JSON.stringify(entities)));
        }
      });
      zip.writeZip();
      dispatch(reportSaved());
    }
  };
}

export function saveAllCorrectionsAs() {
  const path: string | undefined = remote.dialog.showSaveDialogSync(
    remote.getCurrentWindow(),
    {
      filters: [{ name: 'Correctinator', extensions: ['cor'] }],
    }
  );

  if (!path) {
    throw new Error('No directory selected');
  }

  return (dispatch) => {
    createNewCorFile(path);
    dispatch(workspaceSetPath(path));
    dispatch(saveAllCorrections());
  };
}

export function save() {
  return (dispatch, getState) => {
    const workspace: string = selectWorkspacePath(getState());
    if (workspace && Path.extname(workspace) === '.cor') {
      dispatch(saveAllCorrections());
    } else {
      dispatch(saveAllCorrectionsAs());
    }
  };
}

export function exportWorkspace(zipPath: string, workspace: string) {
  const zip = new AdmZip();
  zip.addLocalFolder(workspace);
  zip.writeZip(zipPath);
}
