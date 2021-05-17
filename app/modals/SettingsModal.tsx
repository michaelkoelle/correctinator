/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import {
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
  selectSettings,
  settingsSetAutosave,
  settingsSetBackup,
  settingsSetTheme,
  SettingsState,
} from '../model/SettingsSlice';
import { Theme } from '../model/Theme';
import { ModalProps } from './ModalProvider';
import DialogTitleWithCloseIcon from './DialogTitleWithCloseIcon';

type SettingsModalProps = ModalProps;

const SettingsModal: FC<SettingsModalProps> = ({ ...props }) => {
  const { close } = props;
  const dispatch = useDispatch();
  const settings: SettingsState = useSelector(selectSettings);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const option: Theme = parseInt(
      (event.target as HTMLInputElement).value,
      10
    ) as Theme;
    dispatch(settingsSetTheme(option));
  };

  return (
    <Dialog {...props} fullWidth disableBackdropClick>
      <DialogTitleWithCloseIcon onClose={close}>
        <Typography variant="h5">Settings</Typography>
      </DialogTitleWithCloseIcon>
      <DialogContent dividers>
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
};

export default SettingsModal;
