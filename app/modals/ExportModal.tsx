/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import CheckIcon from '@material-ui/icons/Check';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  useTheme,
} from '@material-ui/core';
import { ipcRenderer, IpcRendererEvent, remote } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { CloseIcon } from '@material-ui/data-grid';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import Sheet from '../model/Sheet';
import DialogTitleWithCloseIcon from './DialogTitleWithCloseIcon';
import { ModalProps } from './ModalProvider';
import { selectCorrectionsBySheetId } from '../model/Selectors';
import * as ExportIPC from '../constants/ExportIPC';
import { ParserType } from '../parser/Parser';
import { ExportProgress } from '../exporter';
import CircularProgressWithLabel from '../components/CircularProgressWithLabel';
import Status from '../model/Status';
import {
  selectSettingsExport,
  settingsSetExport,
} from '../model/SettingsSlice';
import OutputFormatSelect from '../components/OutputFormatSelect';
import ConditionalCommentSettings from '../components/ConditionalCommentSettings';

type ExportModalProps = ModalProps & {
  sheetId: string;
};

enum ExportState {
  EXPORT_NOT_STARTED,
  EXPORT_STARTED,
  EXPORT_SUCCESSFUL,
  EXPORT_FAILED,
}

const ExportModal: FC<ExportModalProps> = ({ ...props }) => {
  const { close, sheetId } = props;
  const theme = useTheme();
  const dispatch = useDispatch();
  const correctionsToExport = useSelector(selectCorrectionsBySheetId(sheetId));
  const workspace = useSelector(selectWorkspacePath);
  const settings = useSelector(selectSettingsExport);
  const [exportError, setExportError] = useState<Error | undefined>(undefined);
  const [exportState, setExportState] = useState<ExportState>(
    ExportState.EXPORT_NOT_STARTED
  );
  const [exportProgress, setExportProgress] = useState<
    ExportProgress | undefined
  >(undefined);

  function closeExportDialog() {
    if (exportState === ExportState.EXPORT_NOT_STARTED) {
      close();
    }
  }

  function onExportCorrections() {
    if (correctionsToExport.length > 0) {
      let defaultPath = 'exported-corrections.zip';
      const sheets: Sheet[] = Array.from(
        correctionsToExport
          .reduce(
            (acc, item) =>
              acc.set(item.submission.sheet.id, item.submission.sheet),
            new Map()
          )
          .values()
      );
      if (sheets.length > 1) {
        defaultPath = sheets
          .map((s) => s.name.replace(' ', '-'))
          .join('-')
          .concat('.zip');
      } else {
        defaultPath = sheets
          .map((s) => {
            const course = s.course.name.replace(' ', '-');
            const term = s.term.summerterm
              ? `SS${s.term.year}`
              : `WS${s.term.year}`;
            const sheet = s.name.replace(' ', '-');
            return `${course}-${term}-${sheet}`;
          })
          .join('-')
          .concat('.zip');
      }

      const p = remote.dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        defaultPath,
        filters: [{ name: 'Zip', extensions: ['zip'] }],
      });

      if (p !== undefined && p?.trim().length > 0) {
        setExportState(ExportState.EXPORT_STARTED);

        ipcRenderer.send(ExportIPC.EXPORT_START, {
          zipPath: p,
          workspace,
          parser: ParserType.Uni2Work,
          corrections: correctionsToExport,
          conditionalComments: settings.conditionalCommentEnabled
            ? settings.conditionalComments
            : [],
        });
      }
    }
  }

  useEffect(() => {
    const handleExportSuccessful = () => {
      setTimeout(() => setExportState(ExportState.EXPORT_SUCCESSFUL), 1000);
    };
    const handleExportFailed = (_event: IpcRendererEvent, error: Error) => {
      setExportError(error);
      setExportState(ExportState.EXPORT_FAILED);
    };
    const handleProgress = (
      _event: IpcRendererEvent,
      progress: ExportProgress
    ) => {
      setTimeout(() => setExportProgress(progress), 1000);
    };

    ipcRenderer.on(ExportIPC.EXPORT_SUCCESSFUL, handleExportSuccessful);
    ipcRenderer.on(ExportIPC.EXPORT_FAILED, handleExportFailed);
    ipcRenderer.on(ExportIPC.EXPORT_PROGRESS, handleProgress);
    return () => {
      ipcRenderer.removeListener(
        ExportIPC.EXPORT_SUCCESSFUL,
        handleExportSuccessful
      );
      ipcRenderer.removeListener(ExportIPC.EXPORT_FAILED, handleExportFailed);
      ipcRenderer.removeListener(ExportIPC.EXPORT_PROGRESS, handleProgress);
    };
  }, []);

  let content;

  switch (exportState) {
    case ExportState.EXPORT_NOT_STARTED:
      content = (
        <Dialog {...props} fullWidth>
          <DialogTitleWithCloseIcon onClose={closeExportDialog}>
            <Typography variant="h5">Export Corrections</Typography>
          </DialogTitleWithCloseIcon>
          <DialogContent
            dividers
            style={{ padding: '0px 8px', overflowX: 'hidden' }}
          >
            <List>
              <ListItem>
                <ListItemText
                  primary="Output Format"
                  secondary="Select the output format you desire"
                />
                <ListItemSecondaryAction>
                  <OutputFormatSelect />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Conditional Comment"
                  secondary="Apppend comment to output depending on score %"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    onChange={() =>
                      dispatch(
                        settingsSetExport({
                          ...settings,
                          conditionalCommentEnabled: !settings.conditionalCommentEnabled,
                        })
                      )
                    }
                    checked={settings.conditionalCommentEnabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              {settings.conditionalCommentEnabled && (
                <ListItem>
                  <ConditionalCommentSettings
                    showLabel={settings.conditionalCommentEnabled}
                  />
                </ListItem>
              )}
              {correctionsToExport.filter(
                (c) => c.rating_done === false || c.status !== Status.Done
              ).length > 0 && (
                <ListItem>
                  <Grid
                    item
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    style={{ marginTop: '5px', marginBottom: '0px' }}
                  >
                    <Grid item>
                      <WarningRoundedIcon
                        style={{
                          background:
                            theme.palette.type === 'dark'
                              ? theme.palette.warning.dark
                              : theme.palette.warning.light,
                          padding: '4px',
                          marginRight: '10px',
                          borderRadius: '50%',
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography>
                        Some corrections you want to export are not finished yet
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={onExportCorrections} color="primary">
              Export as zip
            </Button>
          </DialogActions>
        </Dialog>
      );
      break;
    case ExportState.EXPORT_STARTED:
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
              {exportProgress ? (
                <>
                  <Grid item>
                    <CircularProgressWithLabel
                      value={
                        (exportProgress.steps.reduce((acc, curr, i) => {
                          if (i < exportProgress.stepIndex) {
                            return acc + curr.files.length;
                          }
                          if (i === exportProgress.stepIndex) {
                            return acc + exportProgress.fileIndex + 1;
                          }
                          return acc;
                        }, 0) /
                          exportProgress.steps.reduce(
                            (acc, curr) => acc + curr.files.length,
                            0
                          )) *
                        100
                      }
                      size={30}
                    />
                  </Grid>
                  <Grid item>
                    <Typography gutterBottom>
                      {`${
                        exportProgress.steps[exportProgress.stepIndex].name
                      }...`}
                    </Typography>
                  </Grid>
                  <Grid item style={{ marginTop: '-15px' }}>
                    <Typography gutterBottom>
                      {exportProgress.stepIndex === 0 ? (
                        <b>Export correction: </b>
                      ) : (
                        <b>Check file: </b>
                      )}
                      {
                        exportProgress.steps[exportProgress.stepIndex].files[
                          exportProgress.fileIndex
                        ]
                      }
                    </Typography>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item>
                    <CircularProgress size={30} />
                  </Grid>
                  <Grid item>
                    <Typography gutterBottom>Initializing export...</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
        </Dialog>
      );
      break;
    case ExportState.EXPORT_SUCCESSFUL:
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
                <Typography gutterBottom>Export was successful!</Typography>
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
                  <b>{`${exportError?.name}: `}</b>
                  {exportError?.message}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => setExportState(ExportState.EXPORT_NOT_STARTED)}
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

export default ExportModal;
