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
import StatusIcon from '../../components/StatusIcon';
import Correction from '../../model/Correction';
import { getTotalValueOfRatings } from '../../utils/Formatter';
import { msToTime } from '../../utils/TimeUtil';

type CorrectionTableProps = {
  corrections: Correction[];
};

export default function CorrectionTable(props: CorrectionTableProps) {
  const { corrections } = props;
  const theme = useTheme();

  const rows = corrections
    ? corrections.map((c) => {
        return {
          status: c.status,
          name: c.submission.name,
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
        };
      })
    : [];

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
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell align="center">
                <StatusIcon status={row.status} />
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.course}</TableCell>
              <TableCell>{row.term}</TableCell>
              <TableCell>{row.sheet}</TableCell>
              <TableCell>{`${row.rating} / ${row.max}`}</TableCell>
              <TableCell>{msToTime(row.time).substring(3)}</TableCell>
              <TableCell>{row.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
