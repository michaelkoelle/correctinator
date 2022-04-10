import {
  useTheme,
  ThemeProvider,
  createMuiTheme,
  IconButton,
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import React from 'react';
import MUIDataTable, { MUIDataTableColumnDef } from 'mui-datatables';
import { useDispatch } from 'react-redux';
import StatusIcon from '../../components/StatusIcon';
import Correction from '../../model/Correction';
import {
  correctionPageSetIndexOfCorrection,
  correctionPageSetSheetId,
} from '../../slices/CorrectionPageSlice';
import { setTabIndex } from '../../slices/HomeSlice';
import Status, { statusToString } from '../../model/Status';
import { getTotalValueOfRatings } from '../../utils/Formatter';
import { msToTime } from '../../utils/TimeUtil';

type CorrectionTableProps = {
  title: string;
  corrections: Correction[];
};

declare module '@material-ui/core/styles/overrides' {
  interface ComponentNameToClassKey {
    MUIDataTableHeadCell?: {
      toolButton: {
        marginLeft?: string;
        marginRight?: string;
      };
    };
  }
}

export default function CorrectionTable(props: CorrectionTableProps) {
  const { corrections, title } = props;
  const theme = useTheme();
  const dispatch = useDispatch();

  function openCorrection(sheetId: string, correctionId: string) {
    dispatch(correctionPageSetSheetId(sheetId));
    dispatch(correctionPageSetIndexOfCorrection(correctionId));
    dispatch(setTabIndex(3));
  }

  const getMuiTheme = () =>
    createMuiTheme(
      {
        overrides: {
          MuiPaper: {
            root: {
              // height: 'calc(100% - 20px)',
              height: 'inherit',
            },
          },
          MuiTable: {
            root: {
              userSelect: 'none',
            },
          },
          MuiTableCell: {
            sizeSmall: {
              padding: '12px 12px 12px 12px',
            },
          },
          MuiButton: {
            text: {
              padding: '0px',
            },
          },
          MUIDataTableHeadCell: {
            toolButton: {
              marginLeft: '0px',
              marginRight: '0px',
            },
          },
          MuiToolbar: { root: { minHeight: '50px' } },
        },
      },
      theme
    );

  const columns: MUIDataTableColumnDef[] = [
    {
      name: 'status',
      label: 'Status',
      options: {
        filterOptions: {
          renderValue: (value) => statusToString(parseInt(value, 10) as Status),
        },
        customFilterListOptions: {
          render: (value) => statusToString(parseInt(value, 10) as Status),
        },
        // eslint-disable-next-line react/display-name
        customBodyRender: (value) => {
          return <StatusIcon status={parseInt(value, 10) as Status} />;
        },
      },
    },
    {
      name: 'matNr',
      label: 'MatNr',
    },
    {
      name: 'name',
      label: 'Submission ID',
    },
    {
      name: 'course',
      label: 'Course',
    },
    {
      name: 'term',
      label: 'Term',
    },
    {
      name: 'sheet',
      label: 'Sheet',
    },
    {
      name: 'rating',
      label: 'Rating',
    },
    {
      name: 'time',
      label: 'Time',
    },
    {
      name: 'note',
      label: 'Notes',
    },
    {
      name: '',
      label: 'Go to',
      options: {
        filter: false,
        // eslint-disable-next-line react/display-name
        customBodyRender: (_value, tableMeta) => {
          return (
            <IconButton
              size="small"
              onClick={() => {
                const index = tableMeta.rowIndex;
                if (corrections[index]) {
                  openCorrection(
                    corrections[index].submission.sheet.id,
                    corrections[index].id
                  );
                }
              }}
            >
              <ExitToAppIcon />
            </IconButton>
          );
        },
      },
    },
  ];

  return (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={title}
        data={
          corrections
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
                  rating: `${
                    c.ratings ? getTotalValueOfRatings(c.ratings) : 0
                  } / ${c.submission.sheet.maxValue}`,
                  max: c.submission.sheet.maxValue,
                  valueType: c.submission.sheet.valueType,
                  // eslint-disable-next-line no-nested-ternary
                  time: c.timeElapsed
                    ? c.timeElapsed > 60 * 60 * 1000
                      ? msToTime(c.timeElapsed)
                      : msToTime(c.timeElapsed).substring(3)
                    : 'N/A',
                  note: c.note ? c.note.text : '',
                  correctionId: c.id,
                };
              })
            : []
        }
        columns={columns}
        options={{
          enableNestedDataAccess: '.',
          print: false,
          pagination: false,
          // selectableRows: 'muliple',
          selectableRowsHideCheckboxes: true,
          selectableRowsOnClick: false,
          selectToolbarPlacement: 'none',
          responsive: 'simple',
          tableBodyHeight: 'calc(100% - 65px)',
          // onRowSelectionChange: onSelectionChange,
          setTableProps: () => {
            return {
              // padding: 'none',
              size: 'small',
            };
          },
          setRowProps: (_row, index) => ({
            onDoubleClick: () => {
              if (corrections[index]) {
                openCorrection(
                  corrections[index].submission.sheet.id,
                  corrections[index].id
                );
              }
            },
          }),
        }}
      />
    </ThemeProvider>
  );
}
