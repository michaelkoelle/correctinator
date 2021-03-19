/* eslint-disable react/destructuring-assignment */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  ListItem,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
  useTheme,
} from '@material-ui/core';
import React, { useState } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import { Alert } from '@material-ui/lab';
import ExportDialog from '../../components/ExportDialog';
import Correction from '../../model/Correction';
import Sheet from '../../model/Sheet';
import { setTabIndex } from '../../model/HomeSlice';
import Status from '../../model/Status';
import { SheetSchema } from '../../model/NormalizationSchema';
import { correctionPageSetSheetId } from '../../model/CorrectionPageSlice';
import {
  schemaClearSelectedSheetWithId,
  schemaSetSelectedSheet,
} from '../../model/SchemaSlice';
import {
  deleteCorrectionFromWorkspace,
  reloadState,
  save,
} from '../../utils/FileAccess';
import { selectWorkspacePath } from '../workspace/workspaceSlice';
import SheetEntity from '../../model/SheetEntity';
import {
  selectAllEntities,
  selectCorrectionsBySheetId,
} from '../../model/Selectors';
import { autoCorrectSingleChoiceTasksOfSheet } from '../../utils/AutoCorrection';
import { msToTime } from '../../utils/TimeUtil';
import { getRateableTasks, isSingleChoiceTask } from '../../utils/TaskUtil';
import { overviewClearSelectedSheetWithId } from '../../model/OverviewSlice';
import { selectSettingsAutosave } from '../../model/SettingsSlice';

export default function SheetCard(props: { sheet: SheetEntity }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const workspace = useSelector(selectWorkspacePath);
  const autosave: boolean = useSelector(selectSettingsAutosave);
  const entities = useSelector(selectAllEntities);
  const sheet: Sheet = denormalize(props.sheet, SheetSchema, entities);
  const corrections: Correction[] = useSelector(
    selectCorrectionsBySheetId(sheet.id)
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openAutoCorrectionInfo, setOpenAutoCorrectionInfo] = useState(false);
  const [autoCorrectionCount, setAutoCorrectionCount] = useState<{
    taskCount: number;
    subCount: number;
  }>({ taskCount: 0, subCount: 0 });

  const notInitialized =
    corrections.filter(
      (c) =>
        c?.ratings === undefined ||
        c?.ratings?.length === 0 ||
        c?.submission.sheet.tasks === undefined ||
        c?.submission.sheet.tasks?.length === 0
    ).length > 0;

  const autoCorrectionAvailiable =
    sheet.tasks &&
    getRateableTasks(sheet.tasks).filter((t) => isSingleChoiceTask(t))
      .length !== 0;
  const correctionsFinished =
    corrections.filter((c) => c.status !== Status.Done).length === 0;
  const autoCorrectionAttempted =
    corrections.length !== 0 &&
    corrections.filter((c) => c.autoCorrectionAttempted !== true).length === 0;

  function onStartCorrection() {
    dispatch(correctionPageSetSheetId(sheet.id));
    dispatch(setTabIndex(3));
  }

  function onCreateSchema() {
    dispatch(schemaSetSelectedSheet(sheet.id));
    dispatch(setTabIndex(2));
  }

  function onOpenMenu(event) {
    setAnchorEl(event.currentTarget);
  }

  function onCloseMenu() {
    setAnchorEl(null);
  }

  function onExport() {
    setAnchorEl(null);
    setOpenExportDialog(true);
  }

  function onCloseConfirmDialog() {
    setOpenConfirmDialog(false);
  }

  function onCloseExportDialog() {
    setOpenExportDialog(false);
  }

  function onOpenConfirmDialog() {
    onCloseMenu();
    setOpenConfirmDialog(true);
  }

  function onDeleteSheet() {
    onCloseConfirmDialog();
    dispatch(schemaClearSelectedSheetWithId(sheet.id));
    dispatch(overviewClearSelectedSheetWithId(sheet.id));
    corrections.forEach((c) => deleteCorrectionFromWorkspace(c, workspace));
    dispatch(reloadState());
    if (autosave) {
      dispatch(save());
    }
  }

  function onAutoCorrectSingleChoiceTasks() {
    const counts: any = dispatch(autoCorrectSingleChoiceTasksOfSheet(sheet.id));
    setAnchorEl(null);
    setAutoCorrectionCount(counts);
    setOpenAutoCorrectionInfo(true);
  }

  return (
    <ListItem style={{ width: 'fit-content', margin: '0 auto' }}>
      <Card elevation={4}>
        <CardHeader
          // eslint-disable-next-line prettier/prettier
          action={(
            <>
              <IconButton onClick={onOpenMenu}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={onCloseMenu}
              >
                <MenuItem onClick={onExport}>Export corrections</MenuItem>
                <MenuItem onClick={onOpenConfirmDialog}>Delete sheet</MenuItem>
                <MenuItem onClick={onCreateSchema}>New task schema</MenuItem>
                <MenuItem
                  onClick={onAutoCorrectSingleChoiceTasks}
                  disabled={!autoCorrectionAvailiable}
                >
                  Auto correct single choice tasks
                </MenuItem>
              </Menu>
            </>
            // eslint-disable-next-line prettier/prettier
                    )}
          // eslint-disable-next-line prettier/prettier
          subheader={(
            <>
              <div>
                {`${sheet.school.name} - ${sheet.course.name} ${
                  sheet.term.summerterm
                    ? `SoSe ${sheet.term.year}`
                    : `WiSe ${sheet.term.year}`
                } - ${[
                  ...new Set(corrections.map((c) => c.corrector.name)),
                ].join('-')}`}
              </div>
            </>
            // eslint-disable-next-line prettier/prettier
                    )}
          title={sheet.name}
        />
        <CardContent>
          {notInitialized ? (
            <Typography variant="body2" color="textSecondary">
              <i
                className="fas fa-exclamation-circle"
                style={{
                  marginRight: '10px',
                  color:
                    theme.palette.type === 'dark'
                      ? theme.palette.warning.dark
                      : theme.palette.warning.light,
                }}
              />
              Exercise sheet does not contain a task schema
            </Typography>
          ) : undefined}
          {!notInitialized && !correctionsFinished ? (
            <Typography variant="body2" color="textSecondary">
              <i
                className="fas fa-info-circle"
                style={{
                  marginRight: '10px',
                  color:
                    theme.palette.type === 'dark'
                      ? theme.palette.info.dark
                      : theme.palette.info.light,
                }}
              />
              {`Ready for correction - ${
                corrections.filter((c) => c.status !== Status.Done).length
              } left`}
            </Typography>
          ) : undefined}
          {!notInitialized &&
          !correctionsFinished &&
          corrections.filter((c) => c.status === Status.Marked).length > 0 ? (
            <Typography variant="body2" color="textSecondary">
              <i
                className="fas fa-info-circle"
                style={{
                  marginRight: '10px',
                  color:
                    theme.palette.type === 'dark'
                      ? theme.palette.info.dark
                      : theme.palette.info.light,
                }}
              />
              {`You have marked ${
                corrections.filter((c) => c.status === Status.Marked).length
              } corrections`}
            </Typography>
          ) : undefined}
          {!notInitialized && correctionsFinished ? (
            <Typography variant="body2" color="textSecondary">
              <i
                className="fas fa-check-circle"
                style={{
                  marginRight: '10px',
                  color:
                    theme.palette.type === 'dark'
                      ? theme.palette.success.dark
                      : theme.palette.success.light,
                }}
              />
              Correction finished
            </Typography>
          ) : undefined}
          {autoCorrectionAvailiable &&
          !correctionsFinished &&
          !autoCorrectionAttempted ? (
            <Typography variant="body2" color="textSecondary">
              <i
                className="fas fa-info-circle"
                style={{
                  marginRight: '10px',
                  color:
                    theme.palette.type === 'dark'
                      ? theme.palette.info.dark
                      : theme.palette.info.light,
                }}
              />
              You may try to automatically correct single choice tasks
            </Typography>
          ) : undefined}
        </CardContent>
        <CardActions>
          <Grid container justify="space-between" alignItems="center">
            {notInitialized ? (
              <Grid item>
                <Button onClick={onCreateSchema}>New Task Schema</Button>
              </Grid>
            ) : (
              <Grid item>
                <Button onClick={onStartCorrection}>Correction</Button>
              </Grid>
            )}
            {autoCorrectionAvailiable &&
            !correctionsFinished &&
            !autoCorrectionAttempted ? (
              <Grid item>
                <Button onClick={onAutoCorrectSingleChoiceTasks}>
                  Auto Correction
                </Button>
              </Grid>
            ) : undefined}
            {!notInitialized && correctionsFinished ? (
              <Grid item>
                <Button onClick={onExport}>Export</Button>
              </Grid>
            ) : undefined}
            <Grid item style={{ marginRight: '10px' }}>
              <Typography variant="body2" color="textSecondary">
                <i className="far fa-clock" style={{ marginRight: '10px' }} />
                {msToTime(
                  corrections
                    .filter((s) => s.timeElapsed)
                    .reduce(
                      (a, c) => a + (c.timeElapsed ? c.timeElapsed : 0),
                      0
                    )
                )}
              </Typography>
            </Grid>
          </Grid>
        </CardActions>
        <LinearProgress
          variant="determinate"
          value={
            (corrections.filter((s) => s.status === Status.Done).length /
              corrections.length) *
            100
          }
        />
      </Card>
      <Dialog open={openConfirmDialog} onClose={onCloseConfirmDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete the sheet "${sheet.name}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDeleteSheet} color="primary" autoFocus>
            Yes
          </Button>
          <Button onClick={onCloseConfirmDialog} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
      <ExportDialog
        correctionsToExport={corrections}
        open={openExportDialog}
        handleClose={onCloseExportDialog}
      />
      <Snackbar
        open={openAutoCorrectionInfo}
        autoHideDuration={5000}
        onClose={() => setOpenAutoCorrectionInfo(false)}
      >
        <Alert onClose={() => setOpenAutoCorrectionInfo(false)} severity="info">
          {`Corrected ${autoCorrectionCount.subCount} submissions! (${autoCorrectionCount.taskCount} Single Choice Tasks)`}
        </Alert>
      </Snackbar>
    </ListItem>
  );
}
