import { makeStyles, Paper, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import {
  XAxis,
  YAxis,
  VerticalBarSeries,
  FlexibleXYPlot,
  Hint,
  VerticalBarSeriesPoint,
} from 'react-vis';
import { histogram } from '../../utils/MathUtil';

type HistogramProps = {
  ratings: number[];
};

const useStyles = makeStyles({
  plot: {
    position: 'absolute',
  },
});

export default function Histogram(props: HistogramProps) {
  const { ratings } = props;
  const theme = useTheme();
  const styles = useStyles();

  const [hoveredPoint, setHoveredPoint] = useState<VerticalBarSeriesPoint>();

  const data = histogram(ratings, 10).map((v, i) => {
    return { x: `${i * 10}-${(i + 1) * 10}`, y: v };
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
        onMouseLeave={() => setHoveredPoint(undefined)}
        className={styles.plot}
        style={{
          marginLeft: '-10px',
        }}
      >
        <VerticalBarSeries
          data={data}
          barWidth={0.75}
          color={
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
        />
        <YAxis
          hideTicks
          style={{
            line: { stroke: theme.palette.text.primary },
            title: { fill: theme.palette.text.primary },
            text: { fill: theme.palette.text.primary },
          }}
          title="Number of submissions"
        />
        {hoveredPoint && (
          <Hint
            value={hoveredPoint}
            format={(d) => [{ title: 'Sum', value: d.y }]}
          />
        )}
      </FlexibleXYPlot>
    </Paper>
  );
}
