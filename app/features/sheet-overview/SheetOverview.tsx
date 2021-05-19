import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import React from 'react';
import { remote } from 'electron';
import { openDirectory, reloadState } from '../../utils/FileAccess';
import SheetCardList from './SheetCardList';
import { useAppDispatch } from '../../store';
import { useModal } from '../../modals/ModalProvider';
import ImportModal from '../../modals/ImportModal';

export default function SheetOverview() {
  const dispatch = useAppDispatch();
  const showModal = useModal();

  async function onImportSubmissionsFolder() {
    const path: string = await openDirectory();
    if (path) {
      showModal(ImportModal, { path });
    }
  }

  async function onImportSubmissionsZip() {
    const dialogReturnValue = await remote.dialog.showOpenDialog({
      filters: [{ name: 'Zip', extensions: ['zip'] }],
      properties: ['openFile'],
    });
    const path = dialogReturnValue.filePaths[0];
    if (path) {
      showModal(ImportModal, { path });
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
