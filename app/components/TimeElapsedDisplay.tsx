import { Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

function formatMillis(millis: number | undefined): string {
  let diff = 0;

  if (millis) {
    diff = millis;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const mins = Math.floor(diff / (1000 * 60));
  diff -= mins * (1000 * 60);

  const seconds = Math.floor(diff / 1000);
  diff -= seconds * 1000;

  return `${hours < 10 ? `0${hours}` : hours}:${
    mins < 10 ? `0${mins}` : mins
  }:${seconds < 10 ? `0${seconds}` : seconds}`;
}

function formatDifference(
  date1: Date | undefined,
  date2: Date | undefined,
  elapsed: number | undefined
): string {
  const temp: number = elapsed || 0;

  let millis = temp;
  if (date1 !== undefined && date2 !== undefined) {
    millis = date2.getTime() - date1.getTime() + temp;
  }
  return formatMillis(millis);
}

export default function TimeElapsedDisplay(props: {
  start: Date | undefined;
  elapsed: number | undefined;
}) {
  const { start, elapsed } = props;
  const [time, setTime] = useState<string>(formatMillis(elapsed));

  function tick() {
    setTime(formatDifference(start, new Date(), elapsed));
  }

  useEffect(() => {
    const intervalID = setInterval(() => tick(), 1000);
    return () => {
      clearInterval(intervalID);
    };
  });

  return (
    <Tooltip title="Elapsed time for this correction">
      <Typography>
        <i className="fas fa-stopwatch" style={{ marginRight: '10px' }} />
        {time}
      </Typography>
    </Tooltip>
  );
}
