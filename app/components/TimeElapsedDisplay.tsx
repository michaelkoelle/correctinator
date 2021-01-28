import { Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { formatMillis, formatDifference } from '../utils/TimeUtil';

type TimeElapsedDisplayProps = {
  start: Date | undefined;
  elapsed: number | undefined;
};

export default function TimeElapsedDisplay(props: TimeElapsedDisplayProps) {
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
