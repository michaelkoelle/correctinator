/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Grid, MenuItem, Select, Snackbar, TextField } from '@material-ui/core';
import { remote } from 'electron';
import Path from 'path';
import { useSelector } from 'react-redux';
import { Alert } from '@material-ui/lab';
import { exportCorrections1 } from '../utils/FileAccess';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import ConditionalComment from '../model/ConditionalComment';
import Uni2WorkParser from '../parser/Uni2WorkParser';
import Sheet from '../model/Sheet';
import DialogTitleWithCloseIcon from './DialogTitleWithCloseIcon';
import { ModalProps } from './ModalProvider';
import ConditionalCommentPanel from '../components/ConditionalCommentPanel';
import { selectCorrectionsBySheetId } from '../model/Selectors';

type ExportModalProps = ModalProps & {
  sheetId: string;
};

const ExportModal: FC<ExportModalProps> = ({ ...props }) => {
  const { close, sheetId } = props;
  const correctionsToExport = useSelector(selectCorrectionsBySheetId(sheetId));
  const workspace = useSelector(selectWorkspacePath);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');
  const [exportInProgress, setExportInProgress] = useState(false);
  const [path, setPath] = useState<string>('');
  const [format, setFormat] = useState('Uni2Work');
  const [conditionalComment, setConditionalComment] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const [value, setValue] = useState<number[]>([60, 80, 100]);
  const [comments, setComments] = useState<string[]>([
    'Gut!',
    'Sehr gut!',
    'Perfekt!',
  ]);

  function onChangePath(event) {
    setPath(event.target.value);
  }

  function onChangeFormatSelection(event) {
    setFormat(event.target.value);
  }

  function onChoosePath() {
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
      setPath(p);
    }
  }

  function closeExportDialog() {
    if (!exportInProgress) {
      close();
    }
  }

  function onExportCorrections() {
    if (correctionsToExport.length > 0) {
      setExportInProgress(true);
      const condComments: ConditionalComment[] = value.map((v, i) => {
        return { text: comments[i], minPercentage: v / 100.0 };
      });

      if (path !== undefined) {
        exportCorrections1(
          path,
          workspace,
          new Uni2WorkParser(),
          correctionsToExport,
          conditionalComment ? condComments : []
        )
          .then((v) => {
            setExportInProgress(false);
            closeExportDialog();
            setOpenSuccess(true);
            return v;
          })
          .catch(() => {
            setError(error);
            setExportInProgress(false);
            closeExportDialog();
            setOpenError(true);
          });
      }
      /*
      if (path !== undefined) {
        try {
          exportCorrections(
            path,
            workspace,
            new Uni2WorkParser(),
            correctionsToExport,
            conditionalComment ? condComments : []
          );
          setExportInProgress(false);
          closeExportDialog();
          setOpenSuccess(true);
        } catch (err) {
          setError(error);
          setExportInProgress(false);
          closeExportDialog();
          setOpenError(true);
        }
      }
      */
    }
  }

  /*
  if (
    correctionsToExport.filter(
      (c) => c.rating_done === false || c.status !== Status.Done
    ).length > 0
  ) {
    return (
      <Dialog open={openError} onClose={() => setOpenError(false)}>
        <DialogTitle>Error!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Not all corrections you want to export are finished. Do you want to
            export them anyway?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Yes
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
*/

  return (
    <div>
      <Dialog {...props} fullWidth>
        <DialogTitleWithCloseIcon onClose={closeExportDialog}>
          <Typography variant="h5">Export Corrections</Typography>
        </DialogTitleWithCloseIcon>
        <DialogContent dividers>
          <Grid
            item
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
            style={{ marginBottom: '24px' }}
          >
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h6">Export to:</Typography>
              </Grid>
            </Grid>
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item style={{ width: 'calc(100% - 50px)' }}>
                <TextField
                  // label="Path"
                  variant="outlined"
                  size="small"
                  value={path}
                  onChange={onChangePath}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item>
                <IconButton onClick={onChoosePath}>
                  <FolderIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
            style={{ marginBottom: '24px' }}
          >
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h6">Format</Typography>
              </Grid>
            </Grid>
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Select
                  value={format}
                  onChange={onChangeFormatSelection}
                  variant="outlined"
                  autoWidth
                >
                  <MenuItem value="Uni2Work">Uni2Work</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Grid>
          <ConditionalCommentPanel
            conditionalComment={conditionalComment}
            setConditionalComment={setConditionalComment}
            showLabel={showLabel}
            setShowLabel={setShowLabel}
            value={value}
            setValue={setValue}
            comments={comments}
            setComments={setComments}
          />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={onExportCorrections}
            color="primary"
            disabled={path === undefined || path?.trim()?.length <= 0}
          >
            Export as zip
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openError}
        autoHideDuration={3000}
        onClose={() => setOpenError(false)}
      >
        <Alert onClose={() => setOpenError(false)} severity="error">
          {`Error exporting ${Path.parse(path).base}!`}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
      >
        <Alert onClose={() => setOpenSuccess(false)} severity="success">
          {`Export of ${Path.parse(path).base} was successful!`}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ExportModal;
