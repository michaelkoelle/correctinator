import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ExportDialog from '../../components/ExportDialog';
import TimeAverage from '../../components/TimeAverage';
import TimeElapsedDisplay from '../../components/TimeElapsedDisplay';
import TimeRemaining from '../../components/TimeRemaining';
import Status from '../../model/Status';
import { saveSubmissions, sumParam } from '../../utils/FileAccess';
import CorrectionComment from './CorrectionComment';
import CorrectionOverview from './CorrectionOverview';
import TaskView from './TaskView';

export default function CorrectionView(props: any) {
  const { corrections = [], setCorrections, index, setIndex } = props;
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

  function setCorrection(correction) {
    const temps = [...corrections];
    temps[index] = correction;
    setCorrections(temps);
    saveSubmissions(temps);
  }

  function saveTimeElapsed() {
    const timeEnd = new Date();
    if (timeStart) {
      const diff = timeEnd.getTime() - timeStart?.getTime();
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
        setCorrection(temp);
      }
    }
  }

  useEffect(() => {
    setTimeStart(new Date());
    return () => {
      saveTimeElapsed();
    };
  }, []);

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
      saveTimeElapsed();
      setIndex(index + 1);
      setTimeStart(new Date());
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
    const temps = [...corrections];
    if (temps[index].status !== Status.Marked) {
      temps[index].rating_done = true;
      temps[index].status = Status.Done;
    }
    setCorrections(temps);
    saveSubmissions(temps);

    if (index > 0) {
      saveTimeElapsed();
      setIndex(index - 1);
      setTimeStart(new Date());
    }
  }

  function onNextOpen() {
    // Rating done
    const temps = [...corrections];
    if (temps[index].status !== Status.Marked) {
      temps[index].rating_done = true;
      temps[index].status = Status.Done;
    }
    setCorrections(temps);
    saveSubmissions(temps);
    const nextOpen = corrections?.find((c) => !c?.rating_done);
    if (nextOpen !== undefined) {
      const i = corrections?.indexOf(nextOpen);
      saveTimeElapsed();
      setIndex(i);
      setTimeStart(new Date());
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
        <Grid
          item
          container
          xs={12}
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid
            item
            container
            direction="column"
            style={{ width: 'fit-content' }}
          >
            <Grid item>
              <Typography variant="h3">Correction</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">
                {corrections[index]?.sheet?.name}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Paper style={{ padding: '8px' }}>
              <Typography variant="h5">
                {` ${corrections?.length > 0 ? index + 1 : 0}/${
                  corrections?.length
                }`}
              </Typography>
            </Paper>
          </Grid>
          {corrections?.length > 0 && (
            <Grid
              item
              container
              direction="column"
              style={{ width: 'fit-content' }}
            >
              <Grid item>
                <TimeElapsedDisplay
                  start={timeStart}
                  elapsed={corrections[index]?.timeElapsed}
                />
              </Grid>
              <Grid item>
                <TimeRemaining corrections={corrections} />
              </Grid>
              <Grid item>
                <TimeAverage corrections={corrections} />
              </Grid>
            </Grid>
          )}
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
          <Tooltip title="Mark as done, save and go to the previous correction">
            <span>
              <Button
                color="primary"
                onClick={onPrevious}
                disabled={index === 0}
              >
                {'< Previous'}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title="Mark as done, save and go to the next open correction">
            <span>
              {' '}
              <Button
                color="primary"
                onClick={onNextOpen}
                disabled={corrections.find((c) => !c.rating_done) === undefined}
              >
                {'Next >>'}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title="Mark as done, save and go to the next correction">
            <span>
              <Button
                color="primary"
                onClick={onCorrectionDone}
                // disabled={index === corrections.length - 1}
              >
                {'Next >'}
              </Button>
            </span>
          </Tooltip>
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
