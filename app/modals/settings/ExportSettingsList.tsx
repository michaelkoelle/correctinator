/* eslint-disable react/jsx-curly-newline */
import {
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  List,
  ListItem,
  ListSubheader,
  TextField,
  Collapse,
} from '@material-ui/core';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConditionalCommentSettings from '../../components/ConditionalCommentSettings';
import OutputFormatSelect from '../../components/OutputFormatSelect';
import {
  ExportSettings,
  selectSettingsExport,
  settingsSetExport,
} from '../../slices/SettingsSlice';

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
          primary="Value Type Overwrite"
          secondary="Enable overwrite for the value type e.g. points"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            color="primary"
            onChange={() =>
              dispatch(
                settingsSetExport({
                  ...settings,
                  valueTypeOverrideEnabled: !settings.valueTypeOverrideEnabled,
                })
              )
            }
            checked={settings.valueTypeOverrideEnabled}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={settings.valueTypeOverrideEnabled}>
        <ListItem>
          <ListItemText primary="" secondary="" />
          <ListItemSecondaryAction>
            <TextField
              label="Value Type"
              variant="outlined"
              size="small"
              value={settings.valueTypeOverride}
              onChange={(event) =>
                dispatch(
                  settingsSetExport({
                    ...settings,
                    valueTypeOverride: event.target.value,
                  })
                )
              }
            />
          </ListItemSecondaryAction>
        </ListItem>
      </Collapse>
      <ListItem>
        <ListItemText
          primary="Conditional Comment"
          secondary="Apppend comment to output depending on score %"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            color="primary"
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
      <Collapse in={settings.conditionalCommentEnabled}>
        <ListItem>
          <ConditionalCommentSettings
            showLabel={settings.conditionalCommentEnabled}
          />
        </ListItem>
      </Collapse>
    </List>
  );
};

export default ExportSettingsList;
