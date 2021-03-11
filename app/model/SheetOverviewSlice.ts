import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import fs from 'fs';
import * as Path from 'path';
import AdmZip from 'adm-zip';
import { normalize } from 'normalizr';
import Correction from './Correction';
import Uni2WorkParser from '../parser/Uni2WorkParser';
import { correctionsImport } from './CorrectionsSlice';
import { CorrectionSchema } from './NormalizationSchema';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import Parser, { ParserType } from '../parser/Parser';
import {
  getAllFilesInDirectory,
  copySubmissionFiles,
  existsInWorkspace,
  reloadState,
  createDirectoryInWorkspace,
  saveAllCorrections,
  addFileToWorkspace,
} from '../utils/FileAccess';

/*
export const setImportConflicts = createAction<ImportConflicts>(
  'sheetOverview/setImportConflicts'
);
*/

export type CorrectionImportRequest = {
  path: string;
  parser: ParserType;
};

export type ImportConflicts = {
  conflicts: CorrectionImportRequest[];
  zipPath?: string;
};

export function getParser(type: ParserType): Parser {
  switch (type) {
    case ParserType.Uni2Work:
      return new Uni2WorkParser();
    default:
      return new Uni2WorkParser();
  }
}

function ingestCorrectionFromFolder(
  dispatch: any,
  correction: Correction,
  path: string,
  parser: Parser,
  workspace: string
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
  copySubmissionFiles(files, submissionName, workspace);

  // Save config file
  const { entities } = normalize(correction, CorrectionSchema);
  fs.writeFileSync(
    Path.join(submissionName, 'config.json'),
    JSON.stringify(entities)
  );

  // Update state
  dispatch(correctionsImport(entities));
}

function ingestCorrectionFromZip(
  dispatch: any,
  correction: Correction,
  path: string,
  parser: Parser,
  zip: AdmZip,
  workspace: string
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
  files.forEach((file, i) => {
    const filesDir: string = Path.join(submissionName, 'files');
    const { ext } = Path.parse(file);
    const fileName = `${submissionName}-${i + 1}${ext}`;
    const buffer: Buffer | null = zip.readFile(file);
    if (buffer != null) {
      addFileToWorkspace(`${filesDir}/${fileName}`, buffer, workspace);
    }
  });

  // Save config file
  const { entities } = normalize(correction, CorrectionSchema);
  addFileToWorkspace(
    `${submissionName}/config.json`,
    Buffer.from(JSON.stringify(entities), 'utf8'),
    workspace
  );

  // Update state
  dispatch(correctionsImport(entities));
}

export function importCorrectionsFromFolderToWorkspace(
  dispatch: any,
  parser: Parser,
  path: string,
  workspace: string
) {
  // Import directory
  const configFilePaths = getAllFilesInDirectory(path).filter((file) =>
    file.match(parser.configFilePattern)
  );

  const redundantCorrections: CorrectionImportRequest[] = [];

  configFilePaths.forEach((importPath) => {
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
    }

    ingestCorrectionFromFolder(
      dispatch,
      correction,
      importPath,
      parser,
      workspace
    );
  });

  // Show conflict dialog
  if (redundantCorrections.length > 0) {
    console.log('conflict');
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    dispatch(setImportConflicts({ conflicts: redundantCorrections }));
  }
}

export function importCorrectionsFromZipToWorkspace(
  dispatch: any,
  parser: Parser,
  path: string,
  workspace: string
) {
  const zip = new AdmZip(path);

  const zipEntryDesc = zip.getEntries();
  const configFiles = zipEntryDesc.filter(
    (entry) =>
      !entry.isDirectory && entry.entryName.match(parser.configFilePattern)
  );

  const redundantCorrections: CorrectionImportRequest[] = [];

  configFiles.forEach((zipEntry) => {
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

    ingestCorrectionFromZip(
      dispatch,
      correction,
      zipEntry.entryName,
      parser,
      zip,
      workspace
    );
  });

  // Show conflict dialog
  if (redundantCorrections.length > 0) {
    dispatch(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      setImportConflicts({ conflicts: redundantCorrections, zipPath: path })
    );
  }
}

export const importCorrections = createAsyncThunk<
  boolean,
  { path: string; parserType: ParserType },
  { rejectValue: string }
>(
  'corrections/import',
  async ({ path, parserType }, { getState, dispatch, rejectWithValue }) => {
    const parser: Parser = getParser(parserType);
    const workspace = selectWorkspacePath(getState());

    // Import from zip file or folder?
    const fileStats = fs.statSync(path);

    if (fileStats.isDirectory()) {
      // Import from folder
      importCorrectionsFromFolderToWorkspace(dispatch, parser, path, workspace);
      dispatch(saveAllCorrections());
      return true;
    }

    if (fileStats.isFile() && Path.parse(path).ext.toLowerCase() === '.zip') {
      // Import from zip
      importCorrectionsFromZipToWorkspace(dispatch, parser, path, workspace);
      dispatch(saveAllCorrections());
      return true;
    }

    return rejectWithValue('test');
  }
);

export const overwriteConflictedCorrections = createAsyncThunk<void, void>(
  'corrections/overwrite',
  async (arg, { getState, dispatch }) => {
    const state: any = getState();
    const workspace = selectWorkspacePath(state);
    const importConflicts = state.sheetOverview.conflicts;
    if (importConflicts?.zipPath) {
      // Import from zip
      const zip = new AdmZip(importConflicts.zipPath);
      importConflicts.conflicts.forEach((c) => {
        const zipEntry = zip.getEntry(c.path);
        const content = zipEntry.getData().toString('utf8');
        const parser: Parser = getParser(c.parser);
        const correction: Correction = parser.deserialize(
          content,
          Path.basename(Path.dirname(c.path))
        );
        ingestCorrectionFromZip(
          dispatch,
          correction,
          c.path,
          parser,
          zip,
          workspace
        );
      });
      dispatch(reloadState());
    } else {
      // Import from folder
      importConflicts.conflicts.forEach((c) => {
        const content = fs.readFileSync(c.path, 'utf8');
        const parser: Parser = getParser(c.parser);
        const correction: Correction = parser.deserialize(
          content,
          Path.basename(Path.dirname(c.path))
        );
        ingestCorrectionFromFolder(
          dispatch,
          correction,
          c.path,
          parser,
          workspace
        );
      });
      dispatch(reloadState());
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    dispatch(resetImportConflicts());
  }
);

export interface SheetOverviewState {
  conflicts: ImportConflicts | undefined;
  loading: boolean;
}

const sheetOverviewSlice = createSlice({
  name: 'sheetOverview',
  initialState: {
    conflicts: undefined,
    loading: false,
  } as SheetOverviewState,
  reducers: {
    resetImportConflicts(state) {
      state.conflicts = undefined;
    },
    setImportConflicts(state, action: PayloadAction<ImportConflicts>) {
      state.conflicts = action.payload;
    },
  },
  extraReducers: {
    [importCorrections.pending.type]: (state) => {
      state.loading = true;
    },
    [importCorrections.fulfilled.type]: (state) => {
      state.loading = false;
    },
    [importCorrections.rejected.type]: (state) => {
      state.loading = false;
    },
    [overwriteConflictedCorrections.pending.type]: (state) => {
      state.loading = true;
    },
    [overwriteConflictedCorrections.fulfilled.type]: (state) => {
      state.loading = false;
    },
    [overwriteConflictedCorrections.rejected.type]: (state) => {
      state.loading = false;
    },
    /*
    [setImportConflicts.type]: (
      state,
      action: PayloadAction<ImportConflicts>
    ) => {
      console.log('received');
      state.conflicts = action.payload;
    },
    */
  },
});

export const selectSheetOverviewLoading = (state) =>
  state.sheetOverview.loading;
export const selectsheetOverviewConflicts = (state) =>
  state.sheetOverview.conflicts;

export const {
  resetImportConflicts,
  setImportConflicts,
} = sheetOverviewSlice.actions;

export default sheetOverviewSlice.reducer;
