/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/jsx-wrap-multilines */
import {
  ListItemText,
  ListItemSecondaryAction,
  List,
  ListItem,
  ListSubheader,
  TextField,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CorrectionSettings,
  selectSettingsCorrection,
  settingsSetCorrection,
} from '../../model/SettingsSlice';

const CorrectionSettingsList = () => {
  const dispatch = useDispatch();
  const settings: CorrectionSettings = useSelector(selectSettingsCorrection);

  return (
    <List subheader={<ListSubheader disableSticky>Correction</ListSubheader>}>
      <ListItem>
        <ListItemText
          primary="Task Correct Text"
          secondary="Comment text for a correct task"
        />
        <ListItemSecondaryAction>
          <TextField
            label="Text"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
            value={settings.taskCorrectText}
            onChange={(event) =>
              dispatch(
                settingsSetCorrection({
                  ...settings,
                  taskCorrectText: event.target.value,
                })
              )
            }
          />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Task Incorrect Text"
          secondary="Comment text for a incorrect/missing task"
        />
        <ListItemSecondaryAction>
          <TextField
            label="Text"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
            value={settings.taskIncorrectText}
            onChange={(event) =>
              dispatch(
                settingsSetCorrection({
                  ...settings,
                  taskIncorrectText: event.target.value,
                })
              )
            }
          />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

export default CorrectionSettingsList;
