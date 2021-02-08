/* eslint-disable import/no-cycle */
import { OpenDialogReturnValue, remote } from 'electron';
import fs from 'fs';
import * as Path from 'path';
import 'setimmediate';
import AdmZip from 'adm-zip';
import { normalize } from 'normalizr';
import { serializeCorrection } from './Formatter';
import Correction from '../model/Correction';
import { CorrectionSchema } from '../model/NormalizationSchema';
import Parser from '../parser/Parser';
import ConditionalComment from '../model/ConditionalComment';
import { deleteEntities, correctionsImport } from '../model/CorrectionsSlice';
import { selectAllCorrectionsDenormalized } from '../model/Selectors';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import { reportSaved } from '../model/SaveSlice';

export function createDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dir)) {
    throw new Error(`Cannot create directory "${dir}"!`);
  }
}

export async function openDirectory(): Promise<string> {
  const returnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      /*
      filters: [
        { name: 'Zip', extensions: ['zip'] },
        // { name: 'Correctinator', extensions: ['cor'] },
      ],
      */
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
  dir: string,
  files: string[],
  name: string | undefined = undefined
) {
  const filesDir: string = Path.join(dir, 'files');
  createDirectory(filesDir);
  files.forEach((file, i) => {
    const { base, ext } = Path.parse(file);
    if (name) {
      const fileName = `${name}-${i + 1}${ext}`;
      fs.copyFileSync(file, Path.join(filesDir, fileName));
    } else {
      fs.copyFileSync(file, Path.join(filesDir, base));
    }
  });
}

export function getFilesForCorrectionFromWorkspace(
  submissionName: string,
  workspace: string
): string[] {
  const filesDir: string = Path.join(workspace, submissionName, 'files');
  return getAllFilesInDirectory(filesDir);
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
      Buffer.alloc(content.length, content)
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

export function deleteCorrectionFromWorkspace(
  correction: Correction,
  workspace: string
) {
  deleteFolderRecursive(Path.join(workspace, correction.submission.name));
}

export function saveCorrectionToWorkspace(
  correction: Correction,
  workspace: string
) {
  const correctionDir: string = Path.join(
    workspace,
    correction.submission.name
  );
  const { entities } = normalize(correction, CorrectionSchema);
  try {
    fs.writeFileSync(
      Path.join(correctionDir, 'config.json'),
      JSON.stringify(entities)
    );
  } catch (e) {
    console.log(e);
  }
}

export function existsInWorkspace(name: string, workspace: string): boolean {
  const appPath = Path.join(workspace, name);
  return fs.existsSync(appPath);
}

export function reloadState(workspace: string) {
  return (dispatch, getState) => {
    // Delete old entities
    dispatch(deleteEntities());
    // Load new entities
    getAllFilesInDirectory(workspace)
      .filter((file) => Path.parse(file).base === 'config.json')
      .forEach((file) => {
        const entities = JSON.parse(fs.readFileSync(file, 'utf8'));
        dispatch(correctionsImport(entities));
      });
  };
}

export function saveAllCorrections() {
  return (dispatch, getState) => {
    const state = getState();
    const corrections: Correction[] = selectAllCorrectionsDenormalized(state);
    const workspace: string = selectWorkspacePath(state);
    corrections.forEach((c) => saveCorrectionToWorkspace(c, workspace));
    dispatch(reportSaved());
  };
}

export function exportWorkspace(zipPath: string, workspace: string) {
  const zip = new AdmZip();
  zip.addLocalFolder(workspace);
  zip.writeZip(zipPath);
}

export function deleteEverythingInDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      deleteFolderRecursive(Path.join(dir, file));
    });
  }
}
