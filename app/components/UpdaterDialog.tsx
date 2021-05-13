/* eslint-disable no-case-declarations */
import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import {
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ipcRenderer, shell } from 'electron';
import { UpdateInfo } from 'electron-updater';
import { useDispatch } from 'react-redux';
import { version as currentAppVersion } from '../package.json';
import * as IPCConstants from '../constants/ipc';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import { saveAllCorrections } from '../utils/FileAccess';

type UpdaterDialogProps = {
  open: boolean;
  setOpen: (v: boolean) => unknown;
  showNotAvailiable?: boolean;
};

const defaultProps = {
  showNotAvailiable: false,
};

enum UpdaterState {
  CHECKING_FOR_UPDATE,
  UPDATE_AVAILIABLE,
  UPDATE_NOT_AVAILIABLE,
  DOWNLOADING_UPDATE,
  DOWNLOAD_FAILED,
  UPDATE_DOWNLOADED,
}

function UpdaterDialog(props: UpdaterDialogProps) {
  const { open, setOpen, showNotAvailiable } = props;
  const theme = useTheme();
  const dispatch = useDispatch();
  const [updaterState, setUpdaterState] = useState<UpdaterState>(
    UpdaterState.CHECKING_FOR_UPDATE
  );
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>();
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      ipcRenderer.send(IPCConstants.CHECK_FOR_UPDATE_PENDING);
    }
  }, [open]);

  useEffect(() => {
    ipcRenderer.on(
      IPCConstants.CHECK_FOR_UPDATE_SUCCESS,
      (_event, info: UpdateInfo | undefined) => {
        const version = info && info.version;
        if (version && version !== currentAppVersion) {
          // Only start download if user confirms
          setUpdateInfo(info);
          setUpdaterState(UpdaterState.UPDATE_AVAILIABLE);
        } else if (showNotAvailiable) {
          // No updates found. Show update no availiable content
          setUpdaterState(UpdaterState.UPDATE_NOT_AVAILIABLE);
        } else {
          // No updates found. Just exit for now
          setTimeout(() => {
            setOpen(false);
          }, 1000);
        }
      }
    );

    ipcRenderer.on(IPCConstants.CHECK_FOR_UPDATE_FAILURE, (_event, err) => {
      // Trigger failure in your state.
      setError(err);
      setOpen(false);
    });

    ipcRenderer.on(IPCConstants.DOWNLOAD_UPDATE_PROGRESS, (_event, percent) => {
      setDownloadProgress(percent);
    });

    ipcRenderer.on(IPCConstants.DOWNLOAD_UPDATE_SUCCESS, () => {
      // Update state for download complete
      setUpdaterState(UpdaterState.UPDATE_DOWNLOADED);
      // TODO: for now we just save before installing
      dispatch(saveAllCorrections());
      setTimeout(() => {
        ipcRenderer.send(IPCConstants.QUIT_AND_INSTALL_UPDATE);
        setOpen(false);
      }, 1000);
    });

    ipcRenderer.on(IPCConstants.DOWNLOAD_UPDATE_FAILURE, (_event, err) => {
      // Trigger failure in your state.
      setError(err);
      setUpdaterState(UpdaterState.DOWNLOAD_FAILED);
    });
    return () => {
      ipcRenderer.removeAllListeners(IPCConstants.CHECK_FOR_UPDATE_SUCCESS);
      ipcRenderer.removeAllListeners(IPCConstants.CHECK_FOR_UPDATE_FAILURE);
      ipcRenderer.removeAllListeners(IPCConstants.DOWNLOAD_UPDATE_SUCCESS);
      ipcRenderer.removeAllListeners(IPCConstants.DOWNLOAD_UPDATE_FAILURE);
      ipcRenderer.removeAllListeners(IPCConstants.DOWNLOAD_UPDATE_PROGRESS);
    };
  }, [dispatch, setOpen, showNotAvailiable]);

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
    case UpdaterState.UPDATE_NOT_AVAILIABLE:
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
            <Typography gutterBottom>No updates availiable!</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpen(false)}
            >
              OK
            </Button>
          </Grid>
        </Grid>
      );
      break;
    case UpdaterState.UPDATE_AVAILIABLE:
      let releaseNotes = '';
      const temp = updateInfo?.releaseNotes?.toString().split('\n');
      if (temp) {
        const tempRest = temp.slice(1);
        releaseNotes = tempRest
          .join('\n')
          .replaceAll(
            '<a href',
            `<span style='color:${theme.palette.text.disabled};' id`
          )
          .replaceAll('</a>', '</span>');
      }
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
            <Typography gutterBottom align="center">
              {`Version ${
                updateInfo ? `v${updateInfo.version}` : ''
              } is now availiable!`}
            </Typography>
          </Grid>
          <Grid item>
            <Paper
              variant="outlined"
              style={{ padding: '0px', margin: '12px 0px 12px 0px' }}
            >
              <Typography
                gutterBottom
                align="center"
                style={{ margin: '16px 16px 0px 16px' }}
              >
                Changelog
              </Typography>
              <div
                style={{
                  padding: '0px 16px 16px 16px',
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: releaseNotes,
                }}
              />
            </Paper>
          </Grid>
          {process.platform !== 'darwin' ? (
            <Grid
              item
              container
              justify="center"
              alignItems="center"
              spacing={2}
            >
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
          ) : (
            <Grid
              item
              container
              justify="center"
              alignItems="center"
              spacing={2}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    shell.openExternal(
                      `https://github.com/koellemichael/correctinator/releases/download/v${updateInfo?.version}/${updateInfo?.files[1].url}`
                    );
                  }}
                >
                  Download
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
          )}
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
            {downloadProgress === 0 ? (
              <CircularProgress size={30} />
            ) : (
              <CircularProgressWithLabel value={downloadProgress} size={30} />
            )}
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
          {error && (
            <Grid item>
              <Typography
                color="error"
                style={{ marginTop: '-20px' }}
                gutterBottom
              >
                {error}
              </Typography>
            </Grid>
          )}
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
      <DialogContent style={{ overflow: 'auto' }}>
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

UpdaterDialog.defaultProps = defaultProps;

export default UpdaterDialog;
