import {
  Box,
  Button,
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

export default function SheetOverview() {
  // const { sheets, reload, setSchemaSheet, setSheetToCorrect, setTab } = props;
  const dispatch = useDispatch();
  // const sheets = useSelector(selectAllSheets);
  const workspace = useSelector(selectWorkspacePath);
  const [loading, setLoading] = useState<boolean>(false);
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState<boolean>(
    false
  );
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

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
              <Button color="primary" onClick={onImportSubmissions}>
                Import submissions
              </Button>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => reloadState(dispatch, workspace)}
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
