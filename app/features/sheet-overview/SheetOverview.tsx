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
import RefreshIcon from '@material-ui/icons/Refresh';
import { normalize } from 'normalizr';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Correction from '../../model/Correction';
import { correctionsImport } from '../../model/CorrectionsSlice';
import { CorrectionsSchema } from '../../model/NormalizationSchema';
import Uni2WorkParser from '../../parser/Uni2WorkParser';
import {
  createSubmissionFileStruture,
  existsInAppDir,
  getAllSubmissionDirectories,
  getSubmissionFromAppDataDir,
  openDirectory,
} from '../../utils/FileAccess';
import { selectWorkspacePath } from '../workspace/workspaceSlice';
import SheetCardList from './SheetCardList';

export default function SheetOverview() {
  // const { sheets, reload, setSchemaSheet, setSheetToCorrect, setTab } = props;
  const dispatch = useDispatch();
  // const sheets = useSelector(selectAllSheets);
  const workspacePath = useSelector(selectWorkspacePath);
  const [loading, setLoading] = useState<boolean>(false);
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState<boolean>(
    false
  );
  const [conflicts, setConflicts] = useState<string[]>([]);

  function updateState() {
    const corrections: Correction[] = [];
    console.log(workspacePath);
    const submissionDirectories: string[] = getAllSubmissionDirectories(
      workspacePath
    );
    submissionDirectories.forEach((dir) => {
      const temp = getSubmissionFromAppDataDir(dir, workspacePath);
      corrections.push(Uni2WorkParser.deserialize(temp));
    });
    const normal = normalize(corrections, CorrectionsSchema);
    dispatch(correctionsImport(normal.entities));
  }

  function createFileStructures(paths: string[]) {
    const subs: any[] = [];
    paths.forEach((dir, i) => {
      const temp = createSubmissionFileStruture(dir, workspacePath);
      temp.id = i;
      subs.push(temp);
    });
    updateState();
  }

  async function onImportSubmissions() {
    const path: string = await openDirectory();
    setLoading(true);
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    const noConflict = submissionDirectories.filter(
      (d) => !existsInAppDir(d, workspacePath)
    );
    const conflict = submissionDirectories.filter((d) =>
      existsInAppDir(d, workspacePath)
    );
    createFileStructures(noConflict);
    setLoading(false);
    if (conflict.length > 0) {
      setConflicts(conflict);
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
              <IconButton onClick={updateState} size="small">
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
              createFileStructures(conflicts);
              setOpenOverwriteDialog(false);
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
