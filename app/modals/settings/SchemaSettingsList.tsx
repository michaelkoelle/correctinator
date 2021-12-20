/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/jsx-wrap-multilines */
import {
  ListItemText,
  ListItemSecondaryAction,
  List,
  ListItem,
  FormControlLabel,
  Radio,
  ListSubheader,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InitializationMode from '../../model/InitializationMode';
import {
  SchemaSettings,
  selectSettingsSchema,
  settingsSetSchema,
} from '../../model/SettingsSlice';

const SchemaSettingsList = () => {
  const dispatch = useDispatch();
  const settings: SchemaSettings = useSelector(selectSettingsSchema);

  const handleInitModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const option: InitializationMode = parseInt(
      (event.target as HTMLInputElement).value,
      10
    ) as InitializationMode;
    dispatch(
      settingsSetSchema({
        ...settings,
        initMode: option,
      })
    );
  };

  return (
    <List subheader={<ListSubheader disableSticky>Schema</ListSubheader>}>
      <ListItem>
        <ListItemText
          primary="Initial Value Mode"
          secondary="Opt. = max, Pess. = 0"
        />
        <ListItemSecondaryAction>
          <FormControlLabel
            control={
              <Radio
                checked={settings.initMode === InitializationMode.OPTIMISTIC}
                color="primary"
                onChange={handleInitModeChange}
                value={InitializationMode.OPTIMISTIC}
              />
            }
            label="Optimistic"
            labelPlacement="start"
          />
          <FormControlLabel
            control={
              <Radio
                checked={settings.initMode === InitializationMode.PESSIMISTIC}
                color="primary"
                onChange={handleInitModeChange}
                value={InitializationMode.PESSIMISTIC}
                size="small"
              />
            }
            label="Pessimistic"
            labelPlacement="start"
          />
          <FormControlLabel
            control={
              <Radio
                checked={settings.initMode === InitializationMode.MANUAL}
                color="primary"
                onChange={handleInitModeChange}
                value={InitializationMode.MANUAL}
              />
            }
            label="Manual"
            labelPlacement="start"
          />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

export default SchemaSettingsList;
