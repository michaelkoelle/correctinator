/* eslint-disable react/jsx-no-undef */
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
  MediaViewerSettings,
  selectSettingsMediaViewer,
  settingsSetMediaViewer,
} from '../../model/SettingsSlice';

const MediaViewerSettingsList = () => {
  const dispatch = useDispatch();
  const settings: MediaViewerSettings = useSelector(selectSettingsMediaViewer);

  return (
    <List subheader={<ListSubheader>Media Viewer</ListSubheader>}>
      <ListItem>
        <ListItemText
          primary="Show Filenames"
          secondary="Show name of the current file in toolbar"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={() =>
              dispatch(
                settingsSetMediaViewer({
                  ...settings,
                  showFileName: !settings.showFileName,
                })
              )
            }
            checked={settings.showFileName}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Cycle Files"
          secondary="Clicking next on the last file cycles back to the first"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={() =>
              dispatch(
                settingsSetMediaViewer({
                  ...settings,
                  cycleFiles: !settings.cycleFiles,
                })
              )
            }
            checked={settings.cycleFiles}
          />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

export default MediaViewerSettingsList;
