/* eslint-disable react/jsx-curly-newline */
import { FormControl, MenuItem, Select } from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSettingsExport,
  settingsSetExport,
} from '../model/SettingsSlice';
import { ParserType } from '../parser/Parser';

const OutputFormatSelect = () => {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettingsExport);

  return (
    <FormControl size="small" variant="outlined">
      <Select
        value={settings.outputFormat.toString()}
        onChange={(event) =>
          dispatch(
            settingsSetExport({
              ...settings,
              outputFormat: event.target.value as ParserType,
            })
          )
        }
      >
        {Object.entries(ParserType).map(([key, value]) => {
          return (
            <MenuItem key={key} value={value}>
              {key}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default OutputFormatSelect;
