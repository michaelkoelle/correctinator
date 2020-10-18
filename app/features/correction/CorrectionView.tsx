import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@material-ui/core';
import { remote } from 'electron';
import React, { useState } from 'react';
import {
  exportCorrections,
  getUniqueSheets,
  saveSubmissions,
  sumParam,
} from '../../utils/FileAccess';
import CorrectionOverview from './CorrectionOverview';
import TaskView from './TaskView';

export default function CorrectionView(props: any) {
  const { submissions = [], index, setIndex } = props;
  const [subs, setSubs] = useState(submissions);
  const [open, setOpen] = React.useState(false);

  function onExport() {
    setOpen(false);
    if (submissions.length > 0) {
      const path = remote.dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        defaultPath: getUniqueSheets(submissions)
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
        exportCorrections(submissions, path);
      }
    } else {
      // TODO: show error dialog
    }
  }

  function onCloseDialog() {
    setOpen(false);
  }

  function setTasks(tasks: any) {
    const temps = [...subs];
    temps[index].tasks = tasks;
    temps[index].points = sumParam(tasks, 'value');
    setSubs(temps);
    saveSubmissions(temps);
  }

  function onAddNote() {
    // TODO
  }

  function onCorrectionDone() {
    // Rating done
    const temps = [...subs];
    temps[index].rating_done = true;
    setSubs(temps);
    saveSubmissions(temps);
    // TODO: save and update submission
    if (index + 1 < subs.length) {
      setIndex(index + 1);
      // Check if really finished
    } else if (
      submissions.filter((s) => s.rating_done === false).length === 0
    ) {
      // Prompt to export and create zip
      setOpen(true);
    }
  }

  function onPrevious() {
    // TODO: save and update submission
    if (index > 0) {
      setIndex(index - 1);
    } else {
      // TODO:
      // Reached the first one
    }
  }

  return (
    <div
      style={{
        height: 'calc(100% - 16px)',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '16px',
      }}
    >
      <Grid container spacing={3} justify="space-evenly" alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h3">
            {`Correction ${submissions?.length > 0 ? index + 1 : 0}/${
              submissions?.length
            }`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <CorrectionOverview submission={subs[index]} />
        </Grid>
        <Grid item xs={12} />
      </Grid>
      <TaskView tasks={subs[index]?.tasks} setTasks={setTasks} />
      <Grid
        container
        spacing={3}
        justify="flex-end"
        alignItems="center"
        style={{ padding: '10px' }}
      >
        <Grid item>
          <Button color="secondary" onClick={onAddNote} disabled>
            Add Note
          </Button>
        </Grid>
        <Grid item>
          <Button color="primary" onClick={onPrevious}>
            Previous
          </Button>
        </Grid>
        <Grid item>
          <Button color="primary" onClick={onCorrectionDone}>
            Mark as done and save
          </Button>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={onCloseDialog}>
        <DialogTitle>Export Corrections?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Seems like you finished your correction :) Would you like to export
            the corrections in the Uni2Work format?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onExport} color="primary">
            Yes!!!
          </Button>
          <Button onClick={onCloseDialog} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
