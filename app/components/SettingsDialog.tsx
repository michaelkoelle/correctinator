/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  Button,
  DialogActions,
  FormControlLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Radio,
  Switch,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import {
  SettingsInputComponent,
  SettingsPowerRounded,
} from '@material-ui/icons';
import {
  selectSettings,
  settingsSetAutosave,
  settingsSetBackup,
  settingsSetTheme,
  SettingsState,
} from '../model/SettingsSlice';
import { Theme } from '../model/Theme';
import { ModalProps, useModal } from '../dialogs/ModalProvider';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';

interface SettingsDialogProps {
  open: boolean;
  handleClose: () => void;
}

export default function SettingsDialog(props: SettingsDialogProps) {
  const { open, handleClose } = props;
  const dispatch = useDispatch();
  const modal = useModal();
  const settings: SettingsState = useSelector(selectSettings);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const option: Theme = parseInt(
      (event.target as HTMLInputElement).value,
      10
    ) as Theme;
    dispatch(settingsSetTheme(option));
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h5">Settings</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Button
          onClick={() => {
            modal(ConfirmationDialog, {
              title: 'TEST DIALOG',
              text: 'hi this is a test dialog',
              onConfirm: () => {
                console.log('YEY!');
              },
            });
          }}
        >
          Test
        </Button>
        <List>
          <ListItem>
            <ListItemText
              primary="Themes"
              secondary="Choose your preferred theme"
            />
            <ListItemSecondaryAction>
              <FormControlLabel
                control={
                  <Radio
                    checked={settings.theme === Theme.DARK}
                    onChange={handleThemeChange}
                    value={Theme.DARK}
                  />
                }
                label="Dark"
                labelPlacement="start"
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={settings.theme === Theme.LIGHT}
                    onChange={handleThemeChange}
                    value={Theme.LIGHT}
                    size="small"
                  />
                }
                label="Light"
                labelPlacement="start"
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={settings.theme === Theme.SYSTEM}
                    onChange={handleThemeChange}
                    value={Theme.SYSTEM}
                  />
                }
                label="System"
                labelPlacement="start"
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
          <ListItem>
            <ListItemText
              primary="Backup"
              secondary="Save backups of the current file every 5 minutes"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={
                  () => dispatch(settingsSetBackup(!settings.backup))
                  // eslint-disable-next-line react/jsx-curly-newline
                }
                checked={settings.backup}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}
