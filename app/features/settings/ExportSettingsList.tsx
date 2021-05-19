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
import ConditionalCommentSettings from '../../components/ConditionalCommentSettings';
import OutputFormatSelect from '../../components/OutputFormatSelect';
import {
  ExportSettings,
  selectSettingsExport,
  settingsSetExport,
} from '../../model/SettingsSlice';

const ExportSettingsList = () => {
  const dispatch = useDispatch();
  const settings: ExportSettings = useSelector(selectSettingsExport);

  return (
    <List subheader={<ListSubheader disableSticky>Export</ListSubheader>}>
      <ListItem>
        <ListItemText
          primary="Output Format"
          secondary="Select the output format you desire"
        />
        <ListItemSecondaryAction>
          <OutputFormatSelect />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Conditional Comment"
          secondary="Apppend comment to output depending on score %"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={() =>
              dispatch(
                settingsSetExport({
                  ...settings,
                  conditionalCommentEnabled: !settings.conditionalCommentEnabled,
                })
              )
            }
            checked={settings.conditionalCommentEnabled}
          />
        </ListItemSecondaryAction>
      </ListItem>
      {settings.conditionalCommentEnabled && (
        <ListItem>
          <ConditionalCommentSettings
            showLabel={settings.conditionalCommentEnabled}
          />
        </ListItem>
      )}
    </List>
  );
};

export default ExportSettingsList;
