/* eslint-disable promise/always-return */
/* eslint-disable react/no-danger */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import {
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  Typography,
  useTheme,
} from '@material-ui/core';
import { remote } from 'electron';
import { UpdateCheckResult, UpdateInfo } from 'electron-updater';
import React, { FC, useEffect, useState } from 'react';
import DialogTitleWithCloseIcon from './DialogTitleWithCloseIcon';
import { ModalProps } from './ModalProvider';

type ReleaseNotesModalProps = ModalProps;

const disableLinks = (str, theme) => {
  let result = '';
  const temp = str.toString().split('\n');
  if (temp) {
    const tempRest = temp.slice(1);
    result = tempRest
      .join('\n')
      .replaceAll(
        '<a href',
        `<span style='color:${theme.palette.text.disabled};' id`
      )
      .replaceAll('</a>', '</span>');
  }
  return result;
};

const ReleaseNotesModal: FC<ReleaseNotesModalProps> = ({ ...props }) => {
  const { close } = props;
  const theme = useTheme();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const info: Promise<UpdateCheckResult> = remote
    .require('electron-updater')
    .autoUpdater.checkForUpdates();

  useEffect(() => {
    info
      .then((res: UpdateCheckResult) => {
        setUpdateInfo(res.updateInfo);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  let content: JSX.Element;
  if (loading) {
    // Loading
    content = (
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
    );
  } else if (updateInfo) {
    // Update Info received
    content = (
      <>
        <DialogTitleWithCloseIcon onClose={close}>
          <Typography variant="h5">{`Version ${updateInfo?.version}`}</Typography>
        </DialogTitleWithCloseIcon>
        <DialogContent dividers>
          <div
            dangerouslySetInnerHTML={{
              __html: disableLinks(updateInfo?.releaseNotes, theme),
            }}
          />
        </DialogContent>
      </>
    );
  } else {
    // Error
    content = (
      <DialogContent>
        <Grid
          container
          justify="center"
          alignItems="center"
          style={{ height: '200px' }}
        >
          <Grid item>
            <Typography>Error loading release notes!</Typography>
          </Grid>
        </Grid>
      </DialogContent>
    );
  }

  return (
    <Dialog {...props} fullWidth disableBackdropClick>
      {content}
    </Dialog>
  );
};

export default ReleaseNotesModal;
