import React from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import HelpIcon from '@material-ui/icons/Help';
import LensIcon from '@material-ui/icons/Lens';
import Tooltip from '@material-ui/core/Tooltip';
import Status from '../model/Status';

export default function StatusIcon(props: { status: Status }): JSX.Element {
  const { status } = props;
  console.log(status);
  switch (status) {
    case Status.Done:
      return (
        <Tooltip title="Done">
          <CheckCircleIcon style={{ fill: '#4caf50' }} />
        </Tooltip>
      );
    case Status.Todo:
      return (
        <Tooltip title="Todo">
          <LensIcon style={{ fill: '#ffc107' }} />
        </Tooltip>
      );
    case Status.Marked:
      return (
        <Tooltip title="Marked for later">
          <HelpIcon style={{ fill: '#2979ff' }} />
        </Tooltip>
      );
    default:
      return (
        <Tooltip title="Error">
          <ErrorIcon style={{ fill: '#f44336' }} />
        </Tooltip>
      );
  }
}
