/* eslint-disable react/jsx-curly-newline */
import {
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  List,
  ListItem,
  ListSubheader,
} from '@material-ui/core';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BackupSettings,
  selectSettingsBackup,
  settingsSetBackup,
} from '../../model/SettingsSlice';

const BackupSettingsList = () => {
  const dispatch = useDispatch();
  const settings: BackupSettings = useSelector(selectSettingsBackup);

  return (
    <List subheader={<ListSubheader disableSticky>Backup</ListSubheader>}>
      <ListItem>
        <ListItemText
          primary="Automatic Backup"
          secondary="Save backups of the current file every 5 minutes"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={() =>
              dispatch(
                settingsSetBackup({
                  ...settings,
                  enabled: !settings.enabled,
                })
              )
            }
            checked={settings.enabled}
          />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

export default BackupSettingsList;
