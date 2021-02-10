import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckIcon from '@material-ui/icons/Check';
import {
  CircularProgress,
  DialogContentText,
  Fab,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ipcRenderer } from 'electron';
import { UpdateInfo } from 'electron-updater';
import { version as currentAppVersion } from '../package.json';
import * as IPCConstants from '../constants/ipc';

type UpdaterDialogProps = {
  open: boolean;
  setOpen: (v: boolean) => unknown;
};

enum UpdaterState {
  CHECKING_FOR_UPDATE,
  UPDATE_AVAILIABLE,
  DOWNLOADING_UPDATE,
  DOWNLOAD_FAILED,
  UPDATE_DOWNLOADED,
}

export default function UpdaterDialog(props: UpdaterDialogProps) {
  const { open, setOpen } = props;
  const theme = useTheme();
  const [updaterState, setUpdaterState] = useState<UpdaterState>(
    UpdaterState.CHECKING_FOR_UPDATE
  );
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>();

  useEffect(() => {
    ipcRenderer.send(IPCConstants.CHECK_FOR_UPDATE_PENDING);
  }, []);

  ipcRenderer.on(
    IPCConstants.CHECK_FOR_UPDATE_SUCCESS,
    (event, info: UpdateInfo | undefined) => {
      const version = info && info.version;
      if (version && version !== currentAppVersion) {
        // Only start download if user confirms
        setUpdateInfo(info);
        setUpdaterState(UpdaterState.UPDATE_AVAILIABLE);
      } else {
        // No updates found. Just exit for now
        setTimeout(() => {
          setOpen(false);
        }, 1000);
      }
    }
  );

  ipcRenderer.on(IPCConstants.CHECK_FOR_UPDATE_FAILURE, () => {
    // Trigger failure in your state.
    setOpen(false);
  });

  ipcRenderer.on(IPCConstants.DOWNLOAD_UPDATE_SUCCESS, () => {
    // Update state for download complete
    setUpdaterState(UpdaterState.UPDATE_DOWNLOADED);
    setTimeout(() => {
      ipcRenderer.send(IPCConstants.QUIT_AND_INSTALL_UPDATE);
    }, 1000);
  });

  ipcRenderer.on(IPCConstants.DOWNLOAD_UPDATE_FAILURE, () => {
    // Trigger failure in your state.
    setUpdaterState(UpdaterState.DOWNLOAD_FAILED);
  });

  function onDownloadUpdate() {
    setUpdaterState(UpdaterState.DOWNLOADING_UPDATE);
    ipcRenderer.send(IPCConstants.DOWNLOAD_UPDATE_PENDING);
  }

  let content;
  switch (updaterState) {
    case UpdaterState.CHECKING_FOR_UPDATE:
      content = (
        <Grid
          item
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <Typography gutterBottom>Checking for updates...</Typography>
          </Grid>
          <Grid item>
            <CircularProgress size={30} />
          </Grid>
        </Grid>
      );
      break;
    case UpdaterState.UPDATE_AVAILIABLE:
      content = (
        <Grid
          item
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <Typography gutterBottom>
              {`Version ${
                updateInfo ? `v${updateInfo.version}` : ''
              } is now availiable!`}
            </Typography>
          </Grid>
          <Grid item container justify="center" alignItems="center" spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onDownloadUpdate()}
              >
                Update now
              </Button>
            </Grid>
            <Grid item>
              <IconButton
                style={{ padding: '2px' }}
                onClick={() => setOpen(false)}
              >
                <CloseIcon style={{ width: '1.5rem', height: '1.5rem' }} />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      );
      break;
    case UpdaterState.DOWNLOADING_UPDATE:
      content = (
        <Grid
          item
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <Typography gutterBottom>Downloading update...</Typography>
          </Grid>
          <Grid item>
            <CircularProgress size={30} />
          </Grid>
        </Grid>
      );
      break;
    case UpdaterState.DOWNLOAD_FAILED:
      content = (
        <Grid
          item
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <Typography color="error" gutterBottom>
              Download failed!
            </Typography>
          </Grid>
          <Grid item container justify="center" alignItems="center" spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onDownloadUpdate()}
              >
                Try again
              </Button>
            </Grid>
            <Grid item>
              <IconButton
                style={{ padding: '2px' }}
                onClick={() => setOpen(false)}
              >
                <CloseIcon style={{ width: '1.5rem', height: '1.5rem' }} />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      );
      break;
    case UpdaterState.UPDATE_DOWNLOADED:
      content = (
        <Grid
          item
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <Typography gutterBottom>Success! Restarting...</Typography>
          </Grid>
          <Grid item>
            <CheckIcon
              style={{
                background:
                  theme.palette.type === 'dark'
                    ? theme.palette.success.dark
                    : theme.palette.success.light,
                width: '30px',
                height: '30px',
                padding: '5px',
                borderRadius: '50%',
              }}
            />
          </Grid>
        </Grid>
      );
      break;
    default:
      content = <Typography>Error</Typography>;
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} disableBackdropClick>
      <DialogContent style={{ overflow: 'hidden' }}>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={1}
        >
          <Grid item>
            <img
              style={{ width: '175px', margin: '20px 30px 20px 30px' }}
              src="../resources/icon.ico"
              alt="correctinator"
            />
          </Grid>
          <Grid item style={{ marginBottom: '20px' }}>
            {content}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
