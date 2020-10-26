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
import fs from 'fs';
import RefreshIcon from '@material-ui/icons/Refresh';
import React, { useEffect, useState } from 'react';
import {
  createSubmissionFileStruture,
  existsInAppDir,
  getAllFilesInDirectory,
  getAllRatingFiles,
  getAllSubmissionDirectories,
  getSubmissionDir,
  getSubmissionFromAppDataDir,
  getUniqueSheets,
  openDirectory,
} from '../../utils/FileAccess';
import SheetCardList from './SheetCardList';

export default function SheetOverview(props: any) {
  const { sheets, reload, setSchemaSheet, setSheetToCorrect, setTab } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState<boolean>(
    false
  );
  const [conflicts, setConflicts] = useState<string[]>([]);

  function createFileStructures(paths: string[]) {
    const subs: any[] = [];
    paths.forEach((dir, i) => {
      const temp = createSubmissionFileStruture(dir);
      temp.id = i;
      subs.push(temp);
    });
    reload();
  }

  async function onImportSubmissions() {
    const path: string = await openDirectory();
    setLoading(true);
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    const noConflict = submissionDirectories.filter((d) => !existsInAppDir(d));
    const conflict = submissionDirectories.filter((d) => existsInAppDir(d));
    createFileStructures(noConflict);
    setLoading(false);
    if (conflict.length > 0) {
      setConflicts(conflict);
      setOpenOverwriteDialog(true);
    }
  }

  function onReload() {
    reload();
  }

  function test() {
    /*
    const correction = {
      status: 'DONE',
      corrector: {
        name: 'Michael Kölle',
        location: null,
      },
      submission: {
        name: 'uvswasdesdf',
        filePaths: ['C://Michael Desktop', 'C://Michael Desktop2'],
      },
      rating: {
        value: 12,
        comment: {
          text: 'EIn kommentar',
        }
      }
    };
    */
    // console.log(submissions);
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
              <IconButton onClick={onReload} size="small">
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box flex="1 1 0%" display="flex" flexDirection="column" marginTop="8px">
        <SheetCardList
          sheets={sheets}
          setSheetToCorrect={setSheetToCorrect}
          setSchemaSheet={setSchemaSheet}
          setTab={setTab}
          reload={reload}
        />
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
