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
  Tooltip,
  Typography,
} from '@material-ui/core';
import React from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { denormalize } from 'normalizr';
import CircularProgressWithLabel from '../../components/CircularProgressWithLabel';
import ExportDialog from '../../components/ExportDialog';
import Correction from '../../model/Correction';
import Sheet from '../../model/Sheet';
import { setTabIndex } from '../../model/HomeSlice';
import Status from '../../model/Status';
import {
  selectAllCorrections,
  selectCorrectionEntities,
} from '../../model/CorrectionsSlice';
import CorrectionEntity from '../../model/CorrectionEntity';
import { CorrectionSchema, SheetSchema } from '../../model/NormalizationSchema';
import { selectAllEntities } from '../../rootReducer';
import { correctionPageSetSheetId } from '../../model/CorrectionPageSlice';
import { schemaSetSelectedSheet } from '../../model/SchemaSlice';

export default function SheetCard(props: { sheet: Sheet }) {
  const entities = useSelector(selectAllEntities);
  const sheet: Sheet = denormalize(props.sheet, SheetSchema, entities);
  const dispatch = useDispatch();

  const selectCorrectionsBySheetId = (sheetId) => {
    return createSelector(selectAllCorrections, selectAllEntities, (c, e) =>
      c
        .map((corr: CorrectionEntity) => {
          return denormalize(corr, CorrectionSchema, e);
        })
        .filter((corr: Correction) => {
          return corr.submission && corr.submission.sheet
            ? corr.submission.sheet.id === sheetId
            : false;
        })
    );
  };

  const corrections: Correction[] = useSelector(
    selectCorrectionsBySheetId(sheet.id)
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [openExportDialog, setOpenExportDialog] = React.useState(false);

  function onStartCorrection() {
    dispatch(correctionPageSetSheetId(sheet.id));
    dispatch(setTabIndex(3));
  }

  function onCreateSchema() {
    // TODO
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
    // TODO remove sheet and its submissions and corrections
    // deleteSheet(sheet, workspacePath);
    // reload();
  }

  function msToTime(s) {
    function pad(n, z = 2) {
      return `00${n}`.slice(-z);
    }
    let t = s;
    const ms = t % 1000;
    t = (t - ms) / 1000;
    const secs = t % 60;
    t = (t - secs) / 60;
    const mins = t % 60;
    const hrs = (t - mins) / 60;

    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  function missingSchemas() {
    // TODO Add new status not_initialized
    return (
      corrections.filter(
        (s) => s?.ratings === undefined || s?.ratings?.length === 0
      ).length > 0
    );
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
          <Grid
            item
            container
            direction="row"
            justify="space-between"
            alignItems="center"
            spacing={2}
          >
            <Grid
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
              style={{ width: 'fit-content' }}
            >
              <Grid
                item
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                spacing={2}
              >
                <Grid item>
                  <Tooltip
                    title={`${
                      corrections.filter(
                        (s) => s?.ratings && s?.ratings?.length > 0
                      ).length
                    } / ${corrections.length}`}
                  >
                    <div>
                      <CircularProgressWithLabel
                        value={
                          (corrections.filter(
                            (s) => s?.ratings && s?.ratings?.length > 0
                          ).length /
                            corrections.length) *
                          100
                        }
                      />
                    </div>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Correction scheme assigned
                  </Typography>
                </Grid>
              </Grid>
              <Grid
                item
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                spacing={2}
              >
                <Grid item>
                  <Tooltip
                    title={`${
                      corrections.filter((s) => s.status === Status.Done).length
                    } / ${corrections.length}`}
                  >
                    <div>
                      <CircularProgressWithLabel
                        value={
                          (corrections.filter((s) => s.status === Status.Done)
                            .length /
                            corrections.length) *
                          100
                        }
                      />
                    </div>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Corrections done
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
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
        </CardContent>
        <CardActions>
          <Button onClick={onCreateSchema}>Schema</Button>
          <Button onClick={onStartCorrection} disabled={missingSchemas()}>
            Correction
          </Button>
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
    </ListItem>
  );
}
