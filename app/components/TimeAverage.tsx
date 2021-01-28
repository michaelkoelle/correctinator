import { Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import Correction from '../model/Correction';
import { msToTime, getAverageCorrectionTime } from '../utils/TimeUtil';

type TimeAverageProps = {
  corrections: Correction[];
};

export default function TimeAverage(props: TimeAverageProps) {
  const { corrections = [] } = props;
  const last = 5;

  return (
    <Tooltip
      title={`Average time based on the last ${last.toString()} corrections`}
    >
      <Typography>
        <span style={{ marginRight: '10px' }}>Ø</span>
        {msToTime(getAverageCorrectionTime(last, corrections))}
      </Typography>
    </Tooltip>
  );
}
