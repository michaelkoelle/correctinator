import { Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

export default function TimeAverage(props: any) {
  const { corrections = [] } = props;

  const last = 5;

  function getAverageCorrectionTime(n: number) {
    let correctionsWithTimes: any[] = corrections.filter(
      (c) => c?.timeElapsed !== undefined
    );
    correctionsWithTimes = correctionsWithTimes.slice(
      Math.max(correctionsWithTimes.length - n, 0)
    );

    const timeSum = correctionsWithTimes.reduce((a, c) => a + c.timeElapsed, 0);
    return timeSum / Math.max(correctionsWithTimes.length, 1);
  }

  function msToTime(s) {
    function pad(n, z = 2) {
      return `00${n}`.slice(-z);
    }
    let t = s;
    const ms = t % 1000;
    t = (t - ms) / 1000;
    const secs = t % 60;
    t = (t - secs) / 60;
    const mins = t % 60;
    const hrs = (t - mins) / 60;

    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  return (
    <Tooltip
      title={`Average time based on the last ${last.toString()} corrections`}
    >
      <Typography>
        <span style={{ marginRight: '10px' }}>Ø</span>
        {msToTime(getAverageCorrectionTime(last))}
      </Typography>
    </Tooltip>
  );
}
