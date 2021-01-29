import {
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
import React, { useEffect } from 'react';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import { useDispatch, useSelector } from 'react-redux';
import ExportDialog from '../../components/ExportDialog';
import TimeAverage from '../../components/TimeAverage';
import TimeRemaining from '../../components/TimeRemaining';
import Status from '../../model/Status';
import CorrectionOverview from './CorrectionOverview';
import Correction from '../../model/Correction';
import { upsertCorrection } from '../../model/CorrectionsSlice';
import { correctionPageSetIndex } from '../../model/CorrectionPageSlice';
import CorrectionComment from './CorrectionComment';
import TaskView from './TaskView';
import TimeElapsedDisplay from '../../components/TimeElapsedDisplay';
import { saveCorrectionToWorkspace } from '../../utils/FileAccess';
import { selectWorkspacePath } from '../workspace/workspaceSlice';

type CorrectionViewProps = {
  corrections: Correction[];
  index: number;
  timeStart: Date | undefined;
};

export default function CorrectionView(props: CorrectionViewProps) {
  const { corrections = [], index, timeStart } = props;

  const dispatch = useDispatch();
  const workspace = useSelector(selectWorkspacePath);
  const corr = corrections[index];
  // Dialogs
  const [open, setOpen] = React.useState(false);
  const [openExportDialog, setOpenExportDialog] = React.useState(false);

  useEffect(() => {
    return () => {
      if (corr) {
        saveCorrectionToWorkspace(corr, workspace);
      }
    };
  }, [corr, workspace]);

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

  function setStatusDone() {
    // Rating done
    const correction = corrections[index];
    if (correction.status !== Status.Marked) {
      correction.status = Status.Done;
      dispatch(upsertCorrection(correction));
    }
  }

  function goToNextOpen() {
    // try to find open correction with higher index
    const nextOpenHigherIndex = corrections?.findIndex(
      (c, i) => i > index && c?.status !== Status.Done
    );

    if (nextOpenHigherIndex >= 0) {
      dispatch(correctionPageSetIndex(nextOpenHigherIndex));
    } else {
      // try to find open correction with lower index
      const nextOpen = corrections?.findIndex((c) => c?.status !== Status.Done);
      if (nextOpen >= 0) {
        dispatch(correctionPageSetIndex(nextOpen));
      }
    }
  }

  function onNext() {
    setStatusDone();

    if (index + 1 < corrections.length) {
      dispatch(correctionPageSetIndex(index + 1));
    } else if (
      corrections.filter((c) => c?.status !== Status.Done).length === 0
    ) {
      // Prompt to export and create zip
      setOpen(true);
    } else {
      goToNextOpen();
    }
  }

  function onPrevious() {
    if (index > 0) {
      dispatch(correctionPageSetIndex(index - 1));
    }
  }

  function onFindNextOpen() {
    setStatusDone();
    goToNextOpen();
  }

  function onFirst() {
    dispatch(correctionPageSetIndex(0));
  }

  function onLast() {
    dispatch(correctionPageSetIndex(corrections.length - 1));
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
                {corrections[index]?.submission.sheet.name}
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
          <CorrectionOverview correction={corrections[index]} />
        </Grid>
        <Grid item xs={12} />
      </Grid>
      <TaskView
        tasks={
          corrections ? corrections[index]?.submission?.sheet?.tasks : undefined
        }
        ratings={corrections ? corrections[index]?.ratings : undefined}
        type={
          corrections ? corrections[index]?.submission?.sheet?.valueType : ''
        }
      />
      <Grid
        container
        justify="flex-start"
        alignItems="stretch"
        style={{ marginTop: '16px' }}
      >
        <Grid item xs={12}>
          <CorrectionComment correction={corrections[index]} />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        justify="flex-end"
        alignItems="center"
        style={{ paddingTop: '10px', marginBottom: '-18px' }}
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
                  corrections.find(
                    (c, i) => i !== index && c?.status !== Status.Done
                  ) === undefined
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
                  corrections.find(
                    (c, i) => i !== index && c?.status !== Status.Done
                  ) === undefined
                    ? 'secondary'
                    : 'primary'
                }
                onClick={onNext}
                variant="contained"
              >
                {index + 1 === corrections.length &&
                corrections.find(
                  (c, i) => i !== index && c?.status !== Status.Done
                ) === undefined ? (
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
