import { makeStyles, Paper, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import {
  XAxis,
  YAxis,
  FlexibleXYPlot,
  Hint,
  VerticalBarSeriesPoint,
  LineSeries,
} from 'react-vis';
import { curveCatmullRom } from 'd3-shape';
import { msToTime } from '../../utils/TimeUtil';

type TimeCurveProps = {
  times: number[];
};

const useStyles = makeStyles({
  plot: {
    position: 'absolute',
  },
});

export default function TimeCurve(props: TimeCurveProps) {
  const { times } = props;
  const theme = useTheme();
  const styles = useStyles();
  const [hoveredPoint, setHoveredPoint] = useState<VerticalBarSeriesPoint>();

  function getTickValues(t: number, max: number): number[] {
    const v: number[] = [];
    for (let i = 0; i <= max; i += Math.ceil(times.length / t)) {
      v.push(i);
    }
    return v;
  }

  const data = times.map((v, i) => {
    return { x: i + 1, y: v };
  });

  return (
    <Paper
      style={{
        height: '100%',
        padding: '10px 0px 0px 0px',
      }}
    >
      <FlexibleXYPlot
        xType="ordinal"
        yDomain={[
          0,
          times && times.length > 0
            ? times.reduce((acc, v) => (v > acc ? v : acc))
            : 0,
        ]}
        onMouseLeave={() => setHoveredPoint(undefined)}
        className={styles.plot}
        style={{
          marginLeft: '-10px',
        }}
      >
        <LineSeries
          data={data}
          curve={curveCatmullRom.alpha(0.5)}
          stroke={
            theme.palette.type === 'dark'
              ? theme.palette.primary.dark
              : theme.palette.primary.light
          }
          onNearestX={(value) => setHoveredPoint(value)}
        />
        <XAxis
          style={{
            line: { stroke: theme.palette.text.primary },
            title: { fill: theme.palette.text.primary },
            text: { fill: theme.palette.text.primary },
          }}
          title="Score in %"
          tickValues={getTickValues(15, times.length)}
        />
        <YAxis
          hideTicks
          style={{
            line: { stroke: theme.palette.text.primary },
            title: { fill: theme.palette.text.primary },
            text: { fill: theme.palette.text.primary },
          }}
          title="Elapsed time"
        />
        {hoveredPoint && (
          <Hint
            value={hoveredPoint}
            format={(d) => [
              { title: 'Time', value: `${msToTime(d.y).substring(3)} min` },
            ]}
          />
        )}
      </FlexibleXYPlot>
    </Paper>
  );
}
