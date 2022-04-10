import React, { ReactNode } from 'react';
import { Tooltip } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { selectSettingsSchema } from '../../slices/SettingsSlice';
import InitializationMode from '../../model/InitializationMode';

type InitModeTooltipProps = {
  children: ReactNode;
};

export default function InitModeTooltip(props: InitModeTooltipProps) {
  const { children } = props;
  const settings = useSelector(selectSettingsSchema);

  if (settings.initMode !== InitializationMode.MANUAL) {
    return (
      <Tooltip title="Read-only because of Init Mode">
        <span>{children}</span>
      </Tooltip>
    );
  }
  return <>{children}</>;
}
