import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import * as Path from 'path';
import fs from 'fs';
import RefreshIcon from '@material-ui/icons/Refresh';
import { normalize } from 'normalizr';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdmZip from 'adm-zip';
import { dialog, remote } from 'electron';
import Correction from '../../model/Correction';
import {
  correctionsImport,
  deleteEntities,
} from '../../model/CorrectionsSlice';
import { CorrectionSchema } from '../../model/NormalizationSchema';
import Parser from '../../parser/Parser';
import Uni2WorkParser from '../../parser/Uni2WorkParser';
import {
  copySubmissionFiles,
  createDirectory,
  existsInWorkspace,
  getAllFilesInDirectory,
  openDirectory,
  reloadState,
} from '../../utils/FileAccess';
import { selectWorkspacePath } from '../workspace/workspaceSlice';
import SheetCardList from './SheetCardList';

type Conflict = {
  correction: Correction;
  importPath: string;
  parser: Parser;
};

type Conflict1 = {
  conflicts: Conflict[];
  zipPath: string;
};

export default function SheetOverview() {
  const dispatch = useDispatch();
  const workspace = useSelector(selectWorkspacePath);
  const [loading, setLoading] = useState<boolean>(false);
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState<boolean>(
    false
  );
  const [openOverwriteDialog1, setOpenOverwriteDialog1] = useState<boolean>(
    false
  );
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [conflicts1, setConflicts1] = useState<Conflict1>();

  function ingestCorrection(
    correction: Correction,
    path: string,
    parser: Parser
  ) {
    const submissionName = correction.submission.name;
    const correctionDir = Path.join(workspace, submissionName);

    // Create correction directory in workspace
    createDirectory(correctionDir);

    // Create file folder and copy submission files
    // This is not really modular, other parsers could use a different folder structure -> need to add new parser method
    const files: string[] = getAllFilesInDirectory(Path.dirname(path)).filter(
      (file) => !file.match(parser.configFilePattern)
    );
    copySubmissionFiles(correctionDir, files, submissionName);

    // Save config file
    const { entities } = normalize(correction, CorrectionSchema);
    fs.writeFileSync(
      Path.join(correctionDir, 'config.json'),
      JSON.stringify(entities)
    );

    // Update state
    dispatch(correctionsImport(entities));
  }

  function ingestCorrection1(
    correction: Correction,
    path: string,
    parser: Parser,
    zip: any
  ) {
    const submissionName = correction.submission.name;
    const correctionDir = Path.join(workspace, submissionName);

    // Create correction directory in workspace
    createDirectory(correctionDir);
    const zipEntries = zip.getEntries();
    const files: string[] = zipEntries
      .filter(
        (entry) =>
          !entry.isDirectory &&
          !entry.entryName.match(parser.configFilePattern) &&
          entry.entryName.includes(Path.dirname(path))
      )
      .map((entry) => entry.entryName);
    files.forEach((file, i) => {
      const filesDir: string = Path.join(correctionDir, 'files');
      createDirectory(filesDir);
      const { ext } = Path.parse(file);
      const fileName = `${submissionName}-${i + 1}${ext}`;
      zip.extractEntryTo(file, filesDir, false, true, fileName);
    });

    // Save config file
    const { entities } = normalize(correction, CorrectionSchema);
    fs.writeFileSync(
      Path.join(correctionDir, 'config.json'),
      JSON.stringify(entities)
    );

    // Update state
    dispatch(correctionsImport(entities));
  }

  async function onImportSubmissions() {
    const importDir: string = await openDirectory();

    setLoading(true);

    const parser: Parser = new Uni2WorkParser();
    const configFilePaths = getAllFilesInDirectory(importDir).filter((file) =>
      file.match(parser.configFilePattern)
    );

    const redundantCorrections: Conflict[] = [];

    configFilePaths.forEach((importPath) => {
      const content = fs.readFileSync(importPath, 'utf8');
      const correction: Correction = parser.deserialize(content);

      // Were the submissions already imported?
      if (existsInWorkspace(correction.submission.name, workspace)) {
        redundantCorrections.push({
          correction,
          importPath,
          parser,
        });
        return;
      }

      ingestCorrection(correction, importPath, parser);
    });

    setLoading(false);

    // Show conflict dialog
    if (redundantCorrections.length > 0) {
      setConflicts(redundantCorrections);
      setOpenOverwriteDialog(true);
    }
  }

  async function onImportSubmissions1() {
    const parser: Parser = new Uni2WorkParser();

    const dialogReturnValue = await remote.dialog.showOpenDialog({
      filters: [{ name: 'Zip', extensions: ['zip'] }],
      properties: ['openFile'],
    });

    const path = dialogReturnValue.filePaths[0];
    if (path) {
      const zip = new AdmZip(path);

      const zipEntryDesc = zip.getEntries();
      const configFiles = zipEntryDesc.filter(
        (entry) =>
          !entry.isDirectory && entry.entryName.match(parser.configFilePattern)
      );

      const redundantCorrections: Conflict[] = [];

      configFiles.forEach((zipEntry) => {
        const content = zipEntry.getData().toString('utf8');
        const correction: Correction = parser.deserialize(content);

        // Were the submissions already imported?
        if (existsInWorkspace(correction.submission.name, workspace)) {
          redundantCorrections.push({
            correction,
            importPath: zipEntry.entryName,
            parser,
          });
          return;
        }

        ingestCorrection1(correction, zipEntry.entryName, parser, zip);
      });

      setLoading(false);

      // Show conflict dialog
      if (redundantCorrections.length > 0) {
        setConflicts1({ conflicts: redundantCorrections, zipPath: path });
        setOpenOverwriteDialog1(true);
      }
    }
  }

  return (
    <div
      style={{
        height: 'calc(100% - 45px)', // 29px TitleBar + 16px Margin
        display: 'flex',
        flexDirection: 'column',
        marginTop: '16px',
      }}
    >
      <Box>
        <Grid
          container
          justify="center"
          direction="column"
          alignItems="center"
          spacing={4}
        >
          <Grid item xs={12}>
            <Typography variant="h1">Welcome!</Typography>
          </Grid>
          <Grid
            item
            container
            xs={12}
            justify="center"
            direction="row"
            alignItems="center"
            spacing={4}
          >
            <Grid item>
              <ButtonGroup variant="text">
                <Button color="primary" onClick={onImportSubmissions}>
                  Import submissions
                </Button>
                <Button color="primary" onClick={onImportSubmissions1}>
                  (zip)
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => dispatch(reloadState(workspace))}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box flex="1 1 0%" display="flex" flexDirection="column" marginTop="8px">
        <SheetCardList />
      </Box>
      <Dialog
        open={openOverwriteDialog}
        onClose={() => setOpenOverwriteDialog(false)}
      >
        <DialogTitle>{`${conflicts.length} duplicate submissions found!`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to overwrite ${conflicts.length} submissions? This will erase the correction progress of the submissions. This cannot be undone!`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenOverwriteDialog(false);
              setLoading(true);
              conflicts.forEach((c) =>
                ingestCorrection(c.correction, c.importPath, c.parser)
              );
              setLoading(false);
              dispatch(reloadState(workspace));
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              setOpenOverwriteDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openOverwriteDialog1}
        onClose={() => setOpenOverwriteDialog1(false)}
      >
        <DialogTitle>
          {`${conflicts1?.conflicts.length} duplicate submissions found!`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to overwrite ${conflicts1?.conflicts.length} submissions? This will erase the correction progress of the submissions. This cannot be undone!`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenOverwriteDialog1(false);
              setLoading(true);
              const zip = new AdmZip(conflicts1?.zipPath);
              conflicts1?.conflicts.forEach((c) =>
                ingestCorrection1(c.correction, c.importPath, c.parser, zip)
              );
              setLoading(false);
              dispatch(reloadState(workspace));
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              setOpenOverwriteDialog1(false);
            }}
            color="primary"
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={loading} fullWidth>
        <DialogContent>
          <Grid
            container
            justify="center"
            alignItems="center"
            style={{ height: '200px' }}
          >
            <Grid item>
              <CircularProgress />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
}
