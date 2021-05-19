/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/jsx-wrap-multilines */
import {
  ListItemText,
  Switch,
  ListItemSecondaryAction,
  List,
  ListItem,
  FormControlLabel,
  Radio,
  ListSubheader,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  GeneralSettings,
  selectSettingsGeneral,
  settingsSetGeneral,
} from '../../model/SettingsSlice';
import { Theme } from '../../model/Theme';

const GeneralSettingsList = () => {
  const dispatch = useDispatch();
  const settings: GeneralSettings = useSelector(selectSettingsGeneral);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const option: Theme = parseInt(
      (event.target as HTMLInputElement).value,
      10
    ) as Theme;
    dispatch(
      settingsSetGeneral({
        ...settings,
        theme: option,
      })
    );
  };

  return (
    <List subheader={<ListSubheader disableSticky>General</ListSubheader>}>
      <ListItem>
        <ListItemText
          primary="Autosave"
          secondary="Automatically saves on actions e.g. clicking Next"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={() =>
              dispatch(
                settingsSetGeneral({
                  ...settings,
                  autosave: !settings.autosave,
                })
              )
            }
            checked={settings.autosave}
          />
        </ListItemSecondaryAction>
      </ListItem>
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
    </List>
  );
};

export default GeneralSettingsList;
