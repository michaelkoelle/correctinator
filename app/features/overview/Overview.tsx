/* eslint-disable react/display-name */
import {
  Button,
  Dialog,
  DialogTitle,
  Grid,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import React from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { remote } from 'electron';
import { getUniqueSheets, exportCorrections } from '../../utils/FileAccess';
import LoadingItemList from '../../components/LoadingItemList';
import Status from '../../model/Status';
import StatusIcon from '../../components/StatusIcon';

const columns = [
  {
    name: 'status',
    label: 'Status',
    options: {
      customBodyRender: (value: Status) => <StatusIcon status={value} />,
    },
  },
  {
    name: 'submission',
    label: 'ID',
  },
  {
    name: 'sheet.name',
    label: 'Sheet',
  },
  {
    name: 'sheet.type',
    label: 'Sheet Type',
  },
  { name: 'points', label: 'Value' },
  {
    name: 'sheet.grading.max',
    label: 'Max',
  },
  {
    name: 'sheet.grading.type',
    label: 'Type',
  },
  { name: 'term', label: 'Term' },
  { name: 'school', label: 'School' },
  { name: 'course', label: 'Course' },
  { name: 'rated_by', label: 'Rated by' },
  { name: 'note', label: 'Note' },
];

export default function Overview(props: any) {
  const { submissions } = props;
  const [open] = React.useState(false);
  const [progress] = React.useState(0) as any;
  const [summaryProgress] = React.useState([]) as any;
  const [selected, setSelected] = React.useState([]) as any;

  const getMuiTheme = () =>
    createMuiTheme({
      overrides: {
        MuiTableCell: {
          root: {
            userSelect: 'none',
          },
        },
      },
    });

  function onExportSubmissions() {
    if (selected.length > 0) {
      const path = remote.dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        defaultPath: getUniqueSheets(selected)
          .map(
            (s) =>
              `${s.sheet.name.replace(' ', '-')}-${s.course.replace(
                ' ',
                '-'
              )}-${s.term.replace(' ', '-')}`
          )
          .join('-'),
        filters: [{ name: 'Zip', extensions: ['zip'] }],
      });
      if (path !== undefined && path.trim().length > 0) {
        exportCorrections(selected, path);
      }
    } else {
      // TODO: show error dialog
    }
  }

  function onSelectionChange(_selected: any, allRowsSelected: any[]): void {
    const sel: any[] = [];
    allRowsSelected.forEach((row) => {
      sel.push(submissions[row.dataIndex]);
    });
    setSelected(sel);
  }

  /*
  function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function onOpen() {
    const path: string = await openDirectory();
    const files = getAllFilesInDirectory(path);

    setProgress(0);
    setOpen(true);
    setSummaryProgress([
      {
        message: 'Searching for submissions...',
        active: true,
        complete: false,
      },
    ]);

    await timeout(1000);

    console.log(files);
    const ratingFiles: string[] = getAllRatingFiles(path);
    console.log(ratingFiles);
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    await timeout(1000);
    setSummaryProgress([
      {
        message: 'Searching for submissions...',
        active: true,
        complete: true,
      },
    ]);
    setProgress(30);

    setSummaryProgress([
      {
        message: 'Searching for submissions...',
        active: true,
        complete: true,
      },
      {
        message: `Creating stuctures [0/${submissionDirectories.length}]...`,
        active: true,
        complete: false,
      },
    ]);
    await timeout(1000);
    const subs: any[] = [];
    submissionDirectories.forEach((dir, i) => {
      const temp = createSubmissionFileStruture(dir);
      temp.id = i;
      subs.push(temp);
    });
    // loadSubmissions();
    setSummaryProgress([
      {
        message: 'Searching for submissions...',
        active: true,
        complete: true,
      },
      {
        message: `Creating stuctures [${submissionDirectories.length}/${submissionDirectories.length}]...`,
        active: true,
        complete: true,
      },
    ]);
    setProgress(100);
    setTimeout(() => setOpen(false), 1000);
  }
*/
  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      style={{
        height: 'calc(100% - 29px)',
      }}
    >
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3">Overview</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            style={{
              width: 'fit-content',
              marginTop: '16px',
              marginBottom: '16px',
              marginRight: '16px',
            }}
            onClick={onExportSubmissions}
            disabled={selected.length <= 0}
          >
            Export selected submissions
          </Button>
        </Grid>
      </Grid>
      <Grid
        item
        style={{
          flex: '1 1 0%',
          height: '0px',
          overflow: 'auto',
          padding: '2px',
          marginRight: '16px',
          marginBottom: '16px',
        }}
      >
        <MuiThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            title="Submission Overview"
            data={submissions}
            columns={columns}
            options={{
              enableNestedDataAccess: '.',
              print: false,
              pagination: false,
              selectableRows: 'muliple',
              selectableRowsHideCheckboxes: true,
              selectableRowsOnClick: true,
              selectToolbarPlacement: 'none',
              responsive: 'simple',
              onRowSelectionChange: onSelectionChange,
              setTableProps: () => {
                return {
                  padding: 'none',
                  size: 'small',
                };
              },
            }}
          />
        </MuiThemeProvider>

        <Dialog open={open}>
          <DialogTitle>Submission import</DialogTitle>
          <LoadingItemList progress={summaryProgress} />
          <LinearProgress variant="determinate" value={progress} />
        </Dialog>
      </Grid>
    </Grid>
  );
}
