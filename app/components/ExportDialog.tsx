/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import FolderIcon from '@material-ui/icons/Folder';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import {
  Collapse,
  Grid,
  MenuItem,
  Paper,
  Select,
  Slider,
  Switch,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { remote } from 'electron';
import Path from 'path';
import { useSelector } from 'react-redux';
import { exportCorrections } from '../utils/FileAccess';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import ConditionalComment from '../model/ConditionalComment';
import Uni2WorkParser from '../parser/Uni2WorkParser';
import Correction from '../model/Correction';
import Sheet from '../model/Sheet';

const PrimaryTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

function ValueLabelComponent(props: any) {
  const { children, open, value, comments } = props;
  return (
    <PrimaryTooltip
      open={open}
      hidden={!open}
      placement="top"
      title={`${comments[children.props['data-index']]} ≥ ${value}`}
      arrow
    >
      {children}
    </PrimaryTooltip>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export default function ExportDialog(props: {
  open: boolean;
  handleClose: () => void;
  correctionsToExport: Correction[];
}) {
  const { open, handleClose, correctionsToExport } = props;
  const workspace = useSelector(selectWorkspacePath);
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [exportInProgress, setExportInProgress] = React.useState(false);
  const [value, setValue] = React.useState<number[]>([60, 80, 100]);
  const [comments, setComments] = React.useState<string[]>([
    'Gut!',
    'Sehr gut!',
    'Perfekt',
  ]);
  const [path, setPath] = React.useState<string>('');
  const [format, setFormat] = React.useState('Uni2Work');
  const [conditionalComment, setConditionalComment] = React.useState(true);
  const [showLabel, setShowLabel] = React.useState(true);

  const marks = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: 25,
      label: '25%',
    },
    {
      value: 50,
      label: '50%',
    },
    {
      value: 75,
      label: '75%',
    },
    {
      value: 100,
      label: '100%',
    },
  ];

  function onChangeComment(event) {
    const temp = [...comments];
    temp[event.target.name] = event.target.value;
    setComments(temp);
  }

  function onChangePath(event) {
    setPath(event.target.value);
  }

  function onChangeFormatSelection(event) {
    setFormat(event.target.value);
  }

  function onChangeSlider(event, newValue) {
    setValue(newValue);
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
      handleClose();
    }
  }

  function onExportCorrections() {
    if (correctionsToExport.length > 0) {
      setExportInProgress(true);
      const condComments: ConditionalComment[] = value.map((v, i) => {
        return { text: comments[i], minPercentage: v };
      });

      if (path !== undefined) {
        if (conditionalComment) {
          exportCorrections(
            path,
            workspace,
            new Uni2WorkParser(),
            correctionsToExport,
            condComments
          );
        } else {
          exportCorrections(
            path,
            workspace,
            new Uni2WorkParser(),
            correctionsToExport,
            condComments
          );
        }
      }
      setExportInProgress(false);
      closeExportDialog();
      setOpenSuccess(true);
    }
  }

  function onToggleConditionalComment() {
    setConditionalComment(!conditionalComment);
    // Workaround for using tooltips
    if (showLabel) {
      setShowLabel(false);
    } else {
      setTimeout(() => {
        setShowLabel(true);
      }, 300);
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
      <Dialog open={open} fullWidth>
        <DialogTitle id="export-dialog-title" onClose={closeExportDialog}>
          <Typography variant="h5">Export Corrections</Typography>
        </DialogTitle>
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
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h6">Conditional Comment</Typography>
              </Grid>
              <Grid item>
                <Switch
                  checked={conditionalComment}
                  onChange={onToggleConditionalComment}
                />
              </Grid>
            </Grid>
            <Collapse in={conditionalComment}>
              <Grid container justify="center" alignItems="center">
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    style={{
                      padding: '50px 60px 16px',
                      marginTop: '16px',
                      marginBottom: '16px',
                      width: 'calc(100% - 50px)',
                    }}
                  >
                    <Slider
                      value={value}
                      valueLabelDisplay="on"
                      marks={marks}
                      onChange={onChangeSlider}
                      ValueLabelComponent={(p) => (
                        <ValueLabelComponent
                          {...p}
                          comments={comments}
                          open={showLabel}
                        />
                      )}
                    />
                  </Paper>
                </Grid>
              </Grid>
              <Grid container justify="flex-start" alignItems="center">
                <Grid item xs={12}>
                  <Typography>Options:</Typography>
                </Grid>
                {comments.map((c, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Grid key={`comment-${i}`} item>
                    <TextField
                      id={`comment-${i}`}
                      label={`Comment ${i}`}
                      name={i.toString()}
                      defaultValue={c}
                      variant="outlined"
                      size="small"
                      onChange={onChangeComment}
                      style={{
                        width: '120px',
                        marginRight: '16px',
                        marginTop: '16px',
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </Grid>
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
      <Dialog open={openSuccess}>
        <MuiDialogTitle>
          <Typography variant="h5">Success!</Typography>
        </MuiDialogTitle>
        <DialogContent>
          Export of
          {` ${Path.parse(path).base} `}
          was successful!
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setOpenSuccess(false)}>
            Nice
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
