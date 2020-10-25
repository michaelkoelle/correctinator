import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

export default function TimeRemaining(props: any) {
  const { corrections = [] } = props;
  const [millis, setMillis] = useState<number>(0);

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

  function getRemainingCorrectionTime() {
    const remainingCount = corrections.filter((c) => !c.rating_done).length;
    const avgTime = getAverageCorrectionTime(3);
    return remainingCount * avgTime;
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

  function tick() {
    if (corrections.length > 0) {
      setMillis(getRemainingCorrectionTime());
    }
  }

  useEffect(() => {
    const intervalID = setInterval(() => tick(), 1000);
    return () => {
      clearInterval(intervalID);
    };
  });

  return (
    <Typography>
      {`${msToTime(millis)} - ${msToTime(getAverageCorrectionTime(3))}`}
    </Typography>
  );
}
