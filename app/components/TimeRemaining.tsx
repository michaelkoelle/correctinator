import { Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Correction from '../model/Correction';
import Status from '../model/Status';
import { getRemainingCorrectionTime, msToTime } from '../utils/TimeUtil';

type TimeRemainingProps = {
  corrections: Correction[];
};

export default function TimeRemaining(props: TimeRemainingProps) {
  const { corrections = [] } = props;
  const [millis, setMillis] = useState<number>(0);

  function tick() {
    if (corrections.length > 0) {
      setMillis(getRemainingCorrectionTime(corrections));
    }
  }

  useEffect(() => {
    const intervalID = setInterval(() => tick(), 1000);
    return () => {
      clearInterval(intervalID);
    };
  });

  return (
    <Tooltip
      title={`Estimated correction time for the remaining ${
        corrections.filter((c) => c.status !== Status.Done).length
      } corrections`}
    >
      <Typography>
        <i className="fas fa-hourglass-half" style={{ marginRight: '10px' }} />
        {msToTime(millis)}
      </Typography>
    </Tooltip>
  );
}
