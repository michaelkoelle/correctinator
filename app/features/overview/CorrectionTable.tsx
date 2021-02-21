import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
} from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import StatusIcon from '../../components/StatusIcon';
import Correction from '../../model/Correction';
import {
  correctionPageSetIndex,
  correctionPageSetIndexOfCorrection,
  correctionPageSetSheetId,
} from '../../model/CorrectionPageSlice';
import { setTabIndex } from '../../model/HomeSlice';
import { getTotalValueOfRatings } from '../../utils/Formatter';
import { msToTime } from '../../utils/TimeUtil';

type CorrectionTableProps = {
  corrections: Correction[];
};

export default function CorrectionTable(props: CorrectionTableProps) {
  const { corrections } = props;
  const theme = useTheme();
  const dispatch = useDispatch();

  const rows = corrections
    ? corrections.map((c) => {
        return {
          status: c.status,
          matNr: c.submission.matNr ? c.submission.matNr : 'anonymous',
          name: c.submission.name,
          sheetId: c.submission.sheet.id,
          sheet: c.submission.sheet.name,
          course: c.submission.sheet.course.name,
          term: `${c.submission.sheet.term.summerterm ? 'SS' : 'WS'}${
            c.submission.sheet.term.year
          }`,
          rating: c.ratings ? getTotalValueOfRatings(c.ratings) : 0,
          max: c.submission.sheet.maxValue,
          valueType: c.submission.sheet.valueType,
          time: c.timeElapsed ? c.timeElapsed : 0,
          note: c.note ? c.note.text : '',
          correctionId: c.id,
        };
      })
    : [];

  function openCorrection(sheetId: string, correctionId: string) {
    dispatch(correctionPageSetSheetId(sheetId));
    dispatch(correctionPageSetIndexOfCorrection(correctionId));
    dispatch(setTabIndex(3));
  }

  return (
    <TableContainer
      component={Paper}
      style={{ height: 'inherit', userSelect: 'none' }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Status
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              MatNr
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Name
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Course
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Term
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Sheet
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Rating
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Time
            </TableCell>
            <TableCell
              style={{ backgroundColor: theme.palette.background.paper }}
            >
              Note
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows
            .sort(
              (el, next) => parseInt(el.matNr, 10) - parseInt(next.matNr, 10)
            )
            .map((row) => (
              <TableRow
                key={row.name}
                onDoubleClick={() => {
                  openCorrection(row.sheetId, row.correctionId);
                }}
              >
                <TableCell align="center">
                  <StatusIcon status={row.status} />
                </TableCell>
                <TableCell>{row.matNr}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.course}</TableCell>
                <TableCell>{row.term}</TableCell>
                <TableCell>{row.sheet}</TableCell>
                <TableCell>{`${row.rating} / ${row.max}`}</TableCell>
                <TableCell>
                  {row.time > 60 * 60 * 1000
                    ? msToTime(row.time)
                    : msToTime(row.time).substring(3)}
                </TableCell>
                <TableCell>{row.note}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
