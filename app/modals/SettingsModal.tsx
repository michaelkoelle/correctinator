/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import { Divider } from '@material-ui/core';
import { ModalProps } from './ModalProvider';
import DialogTitleWithCloseIcon from './DialogTitleWithCloseIcon';
import GeneralSettingsList from '../features/settings/GeneralSettingsList';
import BackupSettingsList from '../features/settings/BackupSettingsList';
import MediaViewerSettingsList from '../features/settings/MediaViewerSettingsList';
import ExportSettingsList from '../features/settings/ExportSettingsList';

type SettingsModalProps = ModalProps;

const SettingsModal: FC<SettingsModalProps> = ({ ...props }) => {
  const { close } = props;

  return (
    <Dialog
      {...props}
      fullWidth
      disableBackdropClick
      style={{ paddingTop: '32px' }}
    >
      <DialogTitleWithCloseIcon onClose={close}>
        <Typography variant="h5">Settings</Typography>
      </DialogTitleWithCloseIcon>
      <DialogContent dividers>
        <GeneralSettingsList />
        <Divider variant="middle" component="div" />
        <BackupSettingsList />
        <Divider variant="middle" component="div" />
        <MediaViewerSettingsList />
        <Divider variant="middle" component="div" />
        <ExportSettingsList />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
