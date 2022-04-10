import React from 'react';
import { Tooltip } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { ToggleButton } from '@material-ui/lab';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbsUpDownIcon from '@material-ui/icons/ThumbsUpDown';
import InitializationMode from '../../model/InitializationMode';
import {
  selectSettingsSchema,
  settingsSetSchema,
} from '../../slices/SettingsSlice';

export default function InitModeToggle() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettingsSchema);

  const getIcon = (mode: InitializationMode) => {
    switch (mode) {
      case InitializationMode.OPTIMISTIC:
        return <ThumbUpIcon />;
      case InitializationMode.PESSIMISTIC:
        return <ThumbDownIcon />;
      default:
        return <ThumbsUpDownIcon />;
    }
  };

  const onChange = () => {
    switch (settings.initMode) {
      case InitializationMode.OPTIMISTIC:
        dispatch(
          settingsSetSchema({
            ...settings,
            initMode: InitializationMode.PESSIMISTIC,
          })
        );
        break;
      case InitializationMode.PESSIMISTIC:
        dispatch(
          settingsSetSchema({
            ...settings,
            initMode: InitializationMode.MANUAL,
          })
        );
        break;
      default:
        dispatch(
          settingsSetSchema({
            ...settings,
            initMode: InitializationMode.OPTIMISTIC,
          })
        );
    }
  };

  return (
    <Tooltip title="Switch Initial Value Mode">
      <span>
        <ToggleButton
          value="init-mode"
          size="small"
          selected={false}
          onChange={onChange}
        >
          {getIcon(settings.initMode)}
        </ToggleButton>
      </span>
    </Tooltip>
  );
}
