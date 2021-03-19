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
import RefreshIcon from '@material-ui/icons/Refresh';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { remote } from 'electron';
import { unwrapResult } from '@reduxjs/toolkit';
import { openDirectory, reloadState, save } from '../../utils/FileAccess';
import SheetCardList from './SheetCardList';
import {
  ImportConflicts,
  importCorrections,
  overwriteConflictedCorrections,
  resetImportConflicts,
  selectsheetOverviewConflicts,
  selectSheetOverviewLoading,
} from '../../model/SheetOverviewSlice';
import { ParserType } from '../../parser/Parser';
import { useAppDispatch } from '../../store';
import { selectSettingsAutosave } from '../../model/SettingsSlice';

export default function SheetOverview() {
  const dispatch = useAppDispatch();
  const autosave = useSelector(selectSettingsAutosave);
  const loading = useSelector(selectSheetOverviewLoading);
  const conflicts: ImportConflicts | undefined = useSelector(
    selectsheetOverviewConflicts
  );
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState<boolean>(
    false
  );

  useEffect(() => {
    if (conflicts) {
      setOpenOverwriteDialog(true);
    }
  }, [conflicts]);

  async function onImportSubmissionsFolder() {
    const path: string = await openDirectory();
    dispatch(importCorrections({ path, parserType: ParserType.Uni2Work }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (autosave) {
          dispatch(save());
        }
        return originalPromiseResult;
      })
      .catch((rejectedValueOrSerializedError) => {
        console.log(rejectedValueOrSerializedError);
      });
  }

  async function onImportSubmissionsZip() {
    const dialogReturnValue = await remote.dialog.showOpenDialog({
      filters: [{ name: 'Zip', extensions: ['zip'] }],
      properties: ['openFile'],
    });
    const path = dialogReturnValue.filePaths[0];
    if (path) {
      dispatch(importCorrections({ path, parserType: ParserType.Uni2Work }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (autosave) {
            dispatch(save());
          }
          return originalPromiseResult;
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
        });
    }
  }

  async function onOverwriteConflicts() {
    dispatch(overwriteConflictedCorrections());
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
                <Button color="primary" onClick={onImportSubmissionsFolder}>
                  Import submissions
                </Button>
                <Button color="primary" onClick={onImportSubmissionsZip}>
                  (zip)
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item>
              <IconButton onClick={() => dispatch(reloadState())} size="small">
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
        disableBackdropClick
      >
        <DialogTitle>{`${conflicts?.conflicts.length} duplicate submissions found!`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to overwrite ${conflicts?.conflicts.length} submissions? This will erase the correction progress of the submissions. This cannot be undone!`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenOverwriteDialog(false);
              onOverwriteConflicts();
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              setOpenOverwriteDialog(false);
              dispatch(resetImportConflicts());
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
