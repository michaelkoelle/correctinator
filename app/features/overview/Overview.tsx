/* eslint-disable react/display-name */
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllCorrectionsDenormalized } from '../../model/Selectors';
import Correction from '../../model/Correction';
import { getTotalValueOfRatings } from '../../utils/Formatter';
import Histogram from './Histogram';
import TimeCurve from './TimeCurve';
import CorrectionTable from './CorrectionTable';
import {
  overviewSetSheetId,
  selectOverviewSheetId,
} from '../../model/OverviewSlice';
import { groupBy, zipCorrectionsAndMapToTime } from '../../utils/ArrayUtil';
import { selectAllSheets } from '../../model/SheetSlice';
import SheetEntity from '../../model/SheetEntity';

export default function Overview() {
  const dispatch = useDispatch();
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string | undefined = useSelector(
    selectOverviewSheetId
  );
  const allCorrections: Correction[] = useSelector(
    selectAllCorrectionsDenormalized
  );
  const corrections: Correction[] = selectedSheetId
    ? allCorrections.filter((c) => c.submission.sheet.id === selectedSheetId)
    : allCorrections;

  const ratings: number[] = corrections
    ? corrections
        // .filter((c) => c.status === Status.Done)
        .map((c) =>
          c.ratings
            ? getTotalValueOfRatings(c.ratings) / c.submission.sheet.maxValue
            : 0
        )
    : [];

  function calcAvgTimesOfAllCorrections(aC: Correction[]): number[] {
    const grouped: Map<string, Correction[]> = groupBy(
      aC,
      (c: Correction) => c.submission.sheet.id
    );
    return zipCorrectionsAndMapToTime(Array.from(grouped.values())).map((ta) =>
      ta !== undefined
        ? ta.reduce((a, v) => (v !== undefined ? a + v : a), 0) / ta.length
        : 0
    );
  }

  const times: number[] =
    selectedSheetId && corrections
      ? corrections
          // .filter((c) => c.status === Status.Done)
          .map((c) => (c.timeElapsed ? c.timeElapsed : 0))
      : calcAvgTimesOfAllCorrections(allCorrections);

  return (
    <Grid
      container
      style={{
        height: 'calc(100% - 29px)',
      }}
    >
      <Grid
        item
        xs={8}
        style={{ height: '100%', padding: '20px 10px 20px 10px' }}
      >
        <Grid style={{ padding: '10px 10px 10px 10px' }}>
          <FormControl size="small" variant="outlined">
            <InputLabel id="sheet-select-label">Selected Sheet</InputLabel>
            <Select
              labelId="task-type-select-label"
              id="task-type-select"
              variant="outlined"
              value={selectedSheetId || 'all'}
              onChange={(e) => {
                const value = e.target.value as string;
                const id = value === 'all' ? undefined : value;
                dispatch(overviewSetSheetId(id));
              }}
              style={{ minWidth: '15em' }}
              label="Selected Sheet"
            >
              <MenuItem value="all">All Sheets</MenuItem>
              {sheets.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid
          style={{
            height: 'calc(100% - 20px)',
            padding: '10px 10px 20px 10px',
          }}
        >
          <CorrectionTable corrections={corrections} />
        </Grid>
      </Grid>
      <Grid
        container
        direction="column"
        item
        wrap="nowrap"
        xs={4}
        style={{
          height: '100%',
        }}
      >
        <Grid item xs={12} style={{ padding: '20px 10px 10px 10px' }}>
          <Histogram ratings={ratings} />
        </Grid>
        <Grid item xs={12} style={{ padding: '10px 10px 20px 10px' }}>
          <Paper
            style={{
              height: '100%',
            }}
          >
            <TimeCurve times={times} />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
}
