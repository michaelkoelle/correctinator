import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { remote } from 'electron';
import { unwrapResult } from '@reduxjs/toolkit';
import { openDirectory, reloadState, save } from '../../utils/FileAccess';
import SheetCardList from './SheetCardList';
import {
  ImportConflicts,
  importCorrections,
  selectsheetOverviewConflicts,
} from '../../model/SheetOverviewSlice';
import { ParserType } from '../../parser/Parser';
import { useAppDispatch } from '../../store';
import { selectSettingsGeneral } from '../../model/SettingsSlice';
import { useModal } from '../../modals/ModalProvider';
import ConfirmationDialog from '../../dialogs/ConfirmationDialog';
import OverwriteDuplicateSubmissionsDialog from '../../dialogs/OverwriteDuplicateSubmissionsDialog';

export default function SheetOverview() {
  const dispatch = useAppDispatch();
  const showModal = useModal();
  const { autosave } = useSelector(selectSettingsGeneral);
  const conflicts: ImportConflicts | undefined = useSelector(
    selectsheetOverviewConflicts
  );

  useEffect(() => {
    if (conflicts) {
      showModal(
        ConfirmationDialog,
        OverwriteDuplicateSubmissionsDialog(conflicts?.conflicts.length)
      );
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
      .catch(() => {});
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
        .catch(() => {});
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
    </div>
  );
}
