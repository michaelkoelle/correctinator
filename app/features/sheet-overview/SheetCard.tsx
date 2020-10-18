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
  IconButton,
  LinearProgress,
  ListItem,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import React from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { remote } from 'electron';
import {
  deleteSheet,
  exportCorrections,
  getUniqueSheets,
} from '../../utils/FileAccess';
import { resolveLoader } from '../../../configs/webpack.config.eslint';

export default function SheetCard(props: any) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const {
    sheet,
    submissions,
    setSheetToCorrect,
    setSchemaSheet,
    setTab,
    reload,
  } = props;

  function onStartCorrection() {
    setSheetToCorrect(sheet);
    setTab(3);
  }

  function onCreateSchema() {
    setSchemaSheet(sheet);
    setTab(2);
  }

  function onOpenMenu(event) {
    setAnchorEl(event.currentTarget);
  }

  function onCloseMenu() {
    setAnchorEl(null);
  }

  function onExport() {
    setAnchorEl(null);
    if (submissions.length > 0) {
      const path = remote.dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        defaultPath: `${sheet.sheet.name.replace(
          ' ',
          '-'
        )}-${sheet.course.replace(' ', '-')}-${sheet.term.replace(' ', '-')}`,
        filters: [{ name: 'Zip', extensions: ['zip'] }],
      });
      if (path !== undefined && path.trim().length > 0) {
        exportCorrections(submissions, path);
      }
    } else {
      // TODO: show error dialog
    }
  }

  function onCloseConfirmDialog() {
    setOpenConfirmDialog(false);
  }

  function onOpenConfirmDialog() {
    onCloseMenu();
    setOpenConfirmDialog(true);
  }

  function onDeleteSheet() {
    onCloseConfirmDialog();
    deleteSheet(sheet);
    reload();
  }

  function missingSchemas() {
    return (
      submissions.filter(
        (s) => s?.tasks === undefined || s?.tasks?.length === 0
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
              <div>{`${sheet.school} - ${sheet.course} ${sheet.term} - ${sheet.rated_by}`}</div>
            </>
            // eslint-disable-next-line prettier/prettier
                    )}
          title={sheet.sheet.name}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {`[${submissions.filter((s) => s.tasks?.length > 0).length}/${
              submissions.length
            }] Correction scheme assigned`}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {`[${submissions.filter((s) => s.rating_done === true).length}/${
              submissions.length
            }] Correction done`}
          </Typography>
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
            (submissions.filter((s) => s.rating_done === true).length /
              submissions.length) *
            100
          }
        />
      </Card>
      <Dialog open={openConfirmDialog} onClose={onCloseConfirmDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete the sheet "${sheet.sheet.name}"?`}
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
    </ListItem>
  );
}
