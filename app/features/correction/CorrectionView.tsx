import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import { remote } from 'electron';
import React, { useEffect, useState } from 'react';
import ExportDialog from '../../components/ExportDialog';
import TimeElapsedDisplay from '../../components/TimeElapsedDisplay';
import TimeRemaining from '../../components/TimeRemaining';
import Status from '../../model/Status';
import {
  exportCorrections,
  getUniqueSheets,
  saveSubmissions,
  sumParam,
} from '../../utils/FileAccess';
import CorrectionComment from './CorrectionComment';
import CorrectionOverview from './CorrectionOverview';
import TaskView from './TaskView';

export default function CorrectionView(props: any) {
  const { corrections = [], setCorrections, index, setIndex, sheet } = props;
  const [open, setOpen] = React.useState(false);
  const [openExportDialog, setOpenExportDialog] = React.useState(false);
  const [timeStart, setTimeStart] = useState<Date>(new Date());

  function onExport() {
    setOpen(false);
    setOpenExportDialog(true);
  }

  function onCloseDialog() {
    setOpen(false);
  }

  function onCloseExportDialog() {
    setOpenExportDialog(false);
  }

  function setCorrection(correction, i = index) {
    const temps = [...corrections];
    temps[i] = correction;
    setCorrections(temps);
    saveSubmissions(temps);
  }

  function saveTimeElapsed(start) {
    const timeEnd = new Date();
    if (start) {
      console.log(`saveStartTime: ${start}`);
      console.log(`saveEndTime: ${timeEnd}`);
      const diff = timeEnd.getTime() - start?.getTime();
      console.log(diff);
      let temp = { ...corrections[index] };
      if (temp) {
        if (temp.timeElapsed) {
          temp.timeElapsed += diff;
        } else {
          temp = {
            ...temp,
            timeElapsed: diff,
          };
        }
        setCorrection(temp, index);
      }
    }
  }

  useEffect(() => {
    const now = new Date();
    console.log(`set new date: ${now}`);
    setTimeStart(now);
    return () => {
      saveTimeElapsed(now);
    };
  }, [index]);

  function setTasks(tasks: any) {
    const temps = [...corrections];
    temps[index].tasks = tasks;
    temps[index].points = sumParam(tasks, 'value');
    setCorrections(temps);
    saveSubmissions(temps);
  }

  function onCorrectionDone() {
    // Rating done
    const temps = [...corrections];
    if (temps[index].status !== Status.Marked) {
      temps[index].rating_done = true;
      temps[index].status = Status.Done;
    }
    setCorrections(temps);
    saveSubmissions(temps);
    if (index + 1 < corrections.length) {
      setIndex(index + 1);
      // Check if really finished
    } else if (
      corrections.filter((s) => s.rating_done === false).length === 0
    ) {
      // Prompt to export and create zip
      setOpen(true);
    } else if (
      corrections.filter((s) => s.status === Status.Marked).length > 0
    ) {
      // TODO: go back to marked
    }
  }

  function onPrevious() {
    // TODO: save and update submission
    if (index > 0) {
      setIndex(index - 1);
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
            {`Correction ${corrections?.length > 0 ? index + 1 : 0}/${
              corrections?.length
            }`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TimeElapsedDisplay
            start={timeStart}
            elapsed={corrections[index]?.timeElapsed}
          />
        </Grid>
        <Grid item xs={12}>
          <TimeRemaining corrections={corrections} />
        </Grid>
        <Grid item xs={12}>
          <CorrectionOverview
            correction={corrections[index]}
            setCorrection={setCorrection}
          />
        </Grid>
        <Grid item xs={12} />
      </Grid>
      <TaskView
        corrections={corrections}
        correction={corrections[index]}
        tasks={corrections[index]?.tasks}
        setTasks={setTasks}
      />
      <Grid
        container
        justify="flex-start"
        alignItems="stretch"
        style={{ marginTop: '16px' }}
      >
        <Grid item xs={12}>
          <CorrectionComment
            correction={corrections[index]}
            setCorrection={setCorrection}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        justify="flex-end"
        alignItems="center"
        style={{ padding: '10px' }}
      >
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
      <ExportDialog
        open={openExportDialog}
        handleClose={onCloseExportDialog}
        correctionsToExport={corrections}
      />
    </div>
  );
}
