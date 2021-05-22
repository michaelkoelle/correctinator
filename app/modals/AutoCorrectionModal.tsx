/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CheckIcon from '@material-ui/icons/Check';
import { CloseIcon } from '@material-ui/data-grid';
import {
  Button,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { ModalProps } from './ModalProvider';
import * as AutoCorrectionIPC from '../constants/AutoCorrectionIPC';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import { correctionsUpdateMany } from '../model/CorrectionsSlice';
import CircularProgressWithLabel from '../components/CircularProgressWithLabel';
import { save } from '../utils/FileAccess';
import { AutoCorrectionProgress } from '../autocorrection';
import { selectSettingsGeneral } from '../model/SettingsSlice';
import { ratingsUpdateMany } from '../model/RatingSlice';
import Status from '../model/Status';
import { selectCorrectionsBySheetId } from '../model/Selectors';

type AutoCorrectionModalProps = ModalProps & {
  sheetId: string;
};

enum AutoCorrectionState {
  AUTOCORRECTION_STARTED,
  AUTOCORRECTION_SUCCESSFUL,
  AUTOCORRECTION_FAILED,
}

const AutoCorrectionModal: FC<AutoCorrectionModalProps> = ({ ...props }) => {
  const { close, sheetId } = props;

  const dispatch = useDispatch();
  const theme = useTheme();
  const corrections = useSelector(selectCorrectionsBySheetId(sheetId));
  const { autosave } = useSelector(selectSettingsGeneral);
  const workspace = useSelector(selectWorkspacePath);
  const [
    autoCorrectionState,
    setAutoCorrectionState,
  ] = useState<AutoCorrectionState>(AutoCorrectionState.AUTOCORRECTION_STARTED);
  const [autoCorrectionError, setAutoCorrectionError] = useState<
    Error | undefined
  >();
  const [autoCorrectionProgress, setAutoCorrectionProgress] = useState<
    AutoCorrectionProgress | undefined
  >();
  const [summary, setSummary] = useState<{
    taskCount: number;
    subCount: number;
    percent: number;
  }>({ taskCount: 0, subCount: 0, percent: 0 });

  useEffect(() => {
    const handleAutoCorrectionSuccessful = (
      _event: IpcRendererEvent,
      result
    ) => {
      const {
        attemptedCorrectionIds,
        finishedCorrectionIds,
        totalCorrectedRatings,
        taskCount,
        subCount,
      } = result;

      setSummary({
        taskCount,
        subCount,
        percent: subCount / attemptedCorrectionIds.length,
      });

      setAutoCorrectionState(AutoCorrectionState.AUTOCORRECTION_SUCCESSFUL);

      // Flag Ratings as auto corrected
      if (totalCorrectedRatings) {
        dispatch(
          ratingsUpdateMany(
            totalCorrectedRatings.map(
              (r: { ratingId: string; value: number }) => {
                return {
                  id: r.ratingId,
                  changes: { value: r.value, autoCorrected: true },
                };
              }
            )
          )
        );
      }

      // Flag corrections as auto correction attempted
      dispatch(
        correctionsUpdateMany(
          attemptedCorrectionIds.map((cId: string) => {
            return { id: cId, changes: { autoCorrectionAttempted: true } };
          })
        )
      );

      // Update status of now finished corrections
      if (finishedCorrectionIds) {
        dispatch(
          correctionsUpdateMany(
            finishedCorrectionIds.map((cId: string) => {
              return { id: cId, changes: { status: Status.Done } };
            })
          )
        );
      }

      // Save changes
      if (autosave) {
        dispatch(save());
      }
    };

    const handleAutoCorrectionFailed = (
      _event: IpcRendererEvent,
      error: Error
    ) => {
      setAutoCorrectionError(error);
      setAutoCorrectionState(AutoCorrectionState.AUTOCORRECTION_FAILED);
    };
    const handleProgress = (
      _event: IpcRendererEvent,
      progress: AutoCorrectionProgress
    ) => {
      setAutoCorrectionProgress(progress);
    };

    ipcRenderer.on(
      AutoCorrectionIPC.AUTOCORRECTION_SUCCESSFUL,
      handleAutoCorrectionSuccessful
    );
    ipcRenderer.on(
      AutoCorrectionIPC.AUTOCORRECTION_FAILED,
      handleAutoCorrectionFailed
    );
    ipcRenderer.on(AutoCorrectionIPC.AUTOCORRECTION_PROGRESS, handleProgress);
    ipcRenderer.send(AutoCorrectionIPC.AUTOCORRECTION_START, {
      corrections,
      workspace,
    });

    return () => {
      ipcRenderer.removeListener(
        AutoCorrectionIPC.AUTOCORRECTION_SUCCESSFUL,
        handleAutoCorrectionSuccessful
      );
      ipcRenderer.removeListener(
        AutoCorrectionIPC.AUTOCORRECTION_FAILED,
        handleAutoCorrectionFailed
      );
      ipcRenderer.removeListener(
        AutoCorrectionIPC.AUTOCORRECTION_PROGRESS,
        handleProgress
      );
    };
  }, []);

  let content;

  switch (autoCorrectionState) {
    case AutoCorrectionState.AUTOCORRECTION_STARTED:
      content = (
        <Dialog {...props}>
          <DialogContent style={{ padding: '20px', minWidth: '270px' }}>
            <Grid
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
              style={{ height: '100%' }}
            >
              {autoCorrectionProgress ? (
                <>
                  <Grid item>
                    <CircularProgressWithLabel
                      value={
                        ((autoCorrectionProgress.index + 1) /
                          autoCorrectionProgress.total) *
                        100
                      }
                      size={30}
                    />
                  </Grid>
                  <Grid item>
                    <Typography gutterBottom>
                      <b>Trying to auto correct</b>
                    </Typography>
                  </Grid>
                  <Grid item style={{ marginTop: '-15px' }}>
                    <Typography gutterBottom>
                      {autoCorrectionProgress.name.replace(/(.{20})..+/, '$1…')}
                    </Typography>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item>
                    <CircularProgress size={30} />
                  </Grid>
                  <Grid item>
                    <Typography gutterBottom>
                      Initializing auto correction...
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
        </Dialog>
      );
      break;
    case AutoCorrectionState.AUTOCORRECTION_SUCCESSFUL:
      content = (
        <Dialog {...props}>
          <DialogContent style={{ padding: '20px' }}>
            <Grid
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
              style={{ height: '100%', marginTop: '5px' }}
            >
              <Grid item>
                <CheckIcon
                  style={{
                    background:
                      theme.palette.type === 'dark'
                        ? theme.palette.success.dark
                        : theme.palette.success.light,
                    width: '30px',
                    height: '30px',
                    padding: '5px',
                    borderRadius: '50%',
                  }}
                />
              </Grid>
              <Grid item>
                <Typography gutterBottom>
                  <b>Auto Correction Summary:</b>
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom style={{ marginTop: '-20px' }}>
                  {`Corrected Submissions: ${summary.subCount} (${
                    Math.round(summary.percent * 100 * 10) / 10.0
                  }%, ${summary.taskCount} Tasks)`}
                </Typography>
              </Grid>
              <Grid item style={{ marginBottom: '-5px' }}>
                <Button onClick={close} variant="outlined">
                  CLOSE
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      );
      break;
    default:
      content = (
        <Dialog {...props}>
          <DialogContent style={{ padding: '20px' }}>
            <Grid
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
              style={{ height: '100%' }}
            >
              <Grid item>
                <CloseIcon
                  style={{
                    background:
                      theme.palette.type === 'dark'
                        ? theme.palette.error.dark
                        : theme.palette.error.light,
                    width: '30px',
                    height: '30px',
                    padding: '5px',
                    borderRadius: '50%',
                  }}
                />
              </Grid>
              <Grid item>
                <Typography gutterBottom>
                  <b>{`${autoCorrectionError?.name}: `}</b>
                  {autoCorrectionError?.message}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    ipcRenderer.send(AutoCorrectionIPC.AUTOCORRECTION_START, {
                      corrections,
                      workspace,
                    });
                  }}
                  variant="outlined"
                >
                  Try again
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      );
  }

  return content;
};

export default AutoCorrectionModal;
