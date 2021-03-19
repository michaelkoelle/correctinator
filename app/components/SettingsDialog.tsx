/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { remote } from 'electron';
import {
  selectSettings,
  settingsSetAutosave,
  SettingsState,
} from '../model/SettingsSlice';

interface SettingsDialogProps {
  open: boolean;
  handleClose: () => void;
}

export default function SettingsDialog(props: SettingsDialogProps) {
  const { open, handleClose } = props;
  const dispatch = useDispatch();
  const settings: SettingsState = useSelector(selectSettings);
  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h5">Settings</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <List>
          <ListItem>
            <ListItemText
              primary="Dark Theme"
              secondary="Choose between light/dark theme"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => {
                  remote.nativeTheme.themeSource = remote.nativeTheme
                    .shouldUseDarkColors
                    ? 'light'
                    : 'dark';
                }}
                checked={remote?.nativeTheme?.shouldUseDarkColors}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Autosave"
              secondary="Automatically saves on actions e.g. clicking Next"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={
                  () => dispatch(settingsSetAutosave(!settings.autosave))
                  // eslint-disable-next-line react/jsx-curly-newline
                }
                checked={settings.autosave}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}
