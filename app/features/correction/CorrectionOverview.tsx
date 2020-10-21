import {
  Box,
  Button,
  Collapse,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import React from 'react';
import StatusIcon from '../../components/StatusIcon';
import Status from '../../model/Status';

export default function CorrectionOverview(props: any) {
  const [expanded, setExpanded] = React.useState(false);
  const { correction, setCorrection } = props;

  const handleClick = () => {
    setExpanded(!expanded);
  };

  function onToggleMarked() {
    const temp = { ...correction };
    switch (temp.status) {
      case Status.Todo:
        temp.status = Status.Marked;
        temp.rating_done = false;
        break;
      case Status.Marked:
        temp.status = Status.Todo;
        temp.rating_done = false;
        break;
      case Status.Done:
        temp.status = Status.Marked;
        temp.rating_done = false;
        break;
      default:
    }
    setCorrection(temp);
  }

  function onChangeNote(event) {
    const temp = { ...correction };
    temp.note = event.target.value;
    setCorrection(temp);
  }

  const noteValue = correction?.note === undefined ? '' : correction?.note;

  return (
    <Paper>
      <Grid container spacing={3} justify="space-evenly" alignItems="center">
        <Grid item>
          <StatusIcon status={correction?.status} />
        </Grid>
        <Grid item>
          <Typography variant="h6" display="inline">
            <Box fontWeight="bold" display="inline" marginRight="10px">
              ID:
            </Box>
            <Box display="inline">{correction?.submission}</Box>
          </Typography>
        </Grid>
        <Grid item>
          <div style={{ display: 'inline-flex' }}>
            <div style={{ width: '3em', textAlign: 'right' }}>
              <Typography variant="h6">{correction?.points}</Typography>
            </div>
            <Typography
              variant="h6"
              style={{ marginLeft: '0.5em', marginRight: '0.5em' }}
            >
              /
            </Typography>
            <Typography variant="h6">
              {correction?.sheet?.grading?.max}
            </Typography>
            <Typography variant="h6" style={{ marginLeft: '0.5em' }}>
              {correction?.sheet?.grading?.type}
            </Typography>
          </div>
        </Grid>
        <Grid item>
          <Tooltip title="Mark for later">
            <IconButton onClick={onToggleMarked}>
              {correction?.status === Status.Marked ? (
                <BookmarkIcon />
              ) : (
                <BookmarkBorderIcon />
              )}
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item>
          <IconButton onClick={handleClick} aria-label="show more" size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Grid>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box padding="20px" paddingLeft="30px" paddingRight="30px">
            <Grid item xs={12}>
              <Grid
                container
                spacing={5}
                justify="space-evenly"
                alignItems="center"
              >
                <Grid item xs={12}>
                  <TextField
                    id="note"
                    label="Note"
                    multiline
                    name="note"
                    value={noteValue}
                    onChange={onChangeNote}
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={correction === undefined}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`${correction?.school}`}
                  </Typography>
                  <Typography variant="body1">
                    {`${correction?.course} ${correction?.term}`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`${correction?.sheet?.name}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Type: ${correction?.sheet?.type}`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`Rated by: ${correction?.rated_by}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Rated at: ${correction?.rated_at}`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Grid>
    </Paper>
  );
}
//
