import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
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
  const {
    corrections = [],
    setCorrections,
    index,
    setIndex,
    setCorrection,
    timeStart,
  } = props;
  const [open, setOpen] = React.useState(false);
  const [openExportDialog, setOpenExportDialog] = React.useState(false);

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

  function setTasks(tasks: any) {
    const temps = [...corrections];
    temps[index].tasks = tasks;
    temps[index].points = sumParam(tasks, 'value');
    setCorrections(temps);
  }

  function setStatusDone() {
    // Rating done
    const temps = [...corrections];
    if (temps[index].status !== Status.Marked) {
      temps[index].rating_done = true;
      temps[index].status = Status.Done;
    }
    setCorrections(temps);
  }

  function goToNextOpen() {
    // try to find open correction with higher index
    const nextOpenHigherIndex = corrections?.findIndex(
      (c, i) => i > index && !c?.rating_done
    );

    if (nextOpenHigherIndex >= 0) {
      setIndex(nextOpenHigherIndex);
    } else {
      // try to find open correction with lower index
      const nextOpen = corrections?.findIndex((c) => !c?.rating_done);
      if (nextOpen >= 0) {
        setIndex(nextOpen);
      }
    }
  }

  function onNext() {
    setStatusDone();

    if (index + 1 < corrections.length) {
      setIndex(index + 1);
    } else if (
      corrections.filter((s) => s.rating_done === false).length === 0
    ) {
      // Prompt to export and create zip
      setOpen(true);
    } else {
      goToNextOpen();
    }
  }

  function onPrevious() {
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  function onFindNextOpen() {
    setStatusDone();
    goToNextOpen();
  }

  function onFirst() {
    setIndex(0);
  }

  function onLast() {
    setIndex(corrections.length - 1);
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
        style={{ paddingTop: '10px' }}
      >
        <Grid item>
          <Tooltip title="To first correction">
            <span>
              <IconButton onClick={onFirst} disabled={index === 0}>
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title="To previous correction">
            <span>
              <Button onClick={onPrevious} disabled={index === 0}>
                <NavigateBeforeIcon />
                {' Previous'}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title="Find open correction">
            <span>
              <IconButton
                onClick={onFindNextOpen}
                disabled={
                  corrections.find((c, i) => i !== index && !c.rating_done) ===
                  undefined
                }
              >
                <FindInPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title="Mark as done and next correction">
            <span>
              <Button
                color={
                  index + 1 === corrections.length &&
                  corrections.find((c, i) => i !== index && !c.rating_done) ===
                    undefined
                    ? 'secondary'
                    : 'primary'
                }
                onClick={onNext}
                variant="contained"
              >
                {index + 1 === corrections.length &&
                corrections.find((c, i) => i !== index && !c.rating_done) ===
                  undefined ? (
                  'Finish'
                ) : (
                  <>
                    {'Next '}
                    <NavigateNextIcon />
                  </>
                )}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title="To last correction">
            <span>
              <IconButton
                onClick={onLast}
                disabled={index + 1 === corrections.length}
              >
                <LastPageIcon />
              </IconButton>
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
