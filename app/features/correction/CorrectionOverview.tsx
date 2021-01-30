import {
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatusIcon from '../../components/StatusIcon';
import Status from '../../model/Status';
import { correctionsUpdateOne } from '../../model/CorrectionsSlice';
import Correction from '../../model/Correction';
import { getTotalValueOfRatings, serializeTerm } from '../../utils/Formatter';
import { selectCorrectionPageIndex } from '../../model/CorrectionPageSlice';
import { notesUpdateOne, notesUpsertOne } from '../../model/NoteSlice';

type CorrectionOverviewProps = {
  correction: Correction | undefined;
};

export default function CorrectionOverview(props: CorrectionOverviewProps) {
  const { correction } = props;
  const dispatch = useDispatch();
  const value: number =
    correction && correction.ratings
      ? getTotalValueOfRatings(correction.ratings)
      : 0;
  const index = useSelector(selectCorrectionPageIndex);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(
      !!(
        correction &&
        correction.note &&
        correction.note.text !== '' &&
        correction.status === Status.Marked
      )
    );
  }, [index]);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  function onToggleMarked() {
    if (correction) {
      let status = Status.Todo;
      switch (correction.status) {
        case Status.Todo:
          status = Status.Marked;
          setExpanded(true);
          break;
        case Status.Marked:
          status = Status.Todo;
          setExpanded(false);
          break;
        case Status.Done:
          status = Status.Marked;
          setExpanded(true);
          break;
        default:
          status = Status.Todo;
      }
      dispatch(
        correctionsUpdateOne({ id: correction.id, changes: { status } })
      );
    }
  }

  function onChangeNote(event) {
    if (correction && event.target.value !== undefined) {
      if (correction.note) {
        dispatch(
          notesUpdateOne({
            id: correction.note.id,
            changes: {
              text: event.target.value,
            },
          })
        );
      } else {
        const note = { id: uuidv4(), text: event.target.value };
        dispatch(notesUpsertOne(note));
        dispatch(
          correctionsUpdateOne({
            id: correction.id,
            changes: {
              note: note.id,
            },
          })
        );
      }
    }
  }

  const noteValue = correction?.note === undefined ? '' : correction?.note.text;

  return (
    <Paper>
      <Grid
        container
        spacing={2}
        justify="space-evenly"
        alignItems="center"
        style={{ padding: '0px 15px' }}
      >
        <Grid item style={{ padding: '4px' }}>
          <StatusIcon status={correction ? correction?.status : -1} />
        </Grid>
        <Grid item style={{ padding: '4px' }}>
          <Typography variant="h6" display="inline">
            <Box fontWeight="bold" display="inline" marginRight="10px">
              ID:
            </Box>
            <Box display="inline">{correction?.submission.name}</Box>
          </Typography>
        </Grid>
        <Grid item style={{ padding: '4px' }}>
          <div style={{ display: 'inline-flex' }}>
            <div style={{ width: '3em', textAlign: 'right' }}>
              <Typography variant="h6">{value}</Typography>
            </div>
            <Typography
              variant="h6"
              style={{ marginLeft: '0.5em', marginRight: '0.5em' }}
            >
              /
            </Typography>
            <Typography variant="h6">
              {correction?.submission.sheet?.maxValue}
            </Typography>
            <Typography variant="h6" style={{ marginLeft: '0.5em' }}>
              {correction?.submission.sheet?.valueType}
            </Typography>
          </div>
        </Grid>
        <Grid item style={{ padding: '4px' }}>
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
        <Grid item style={{ padding: '4px' }}>
          <IconButton onClick={handleClick} aria-label="show more" size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Grid>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box padding="20px" paddingLeft="30px" paddingRight="30px">
            <Grid item xs={12} style={{ padding: '4px' }}>
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
                    {`${correction?.submission.sheet.school.name}`}
                  </Typography>
                  <Typography variant="body1">
                    {`${correction?.submission.sheet.course.name} ${
                      correction?.submission.sheet.term
                        ? serializeTerm(correction?.submission.sheet.term)
                        : ''
                    }`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`${correction?.submission.sheet.name}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Type: ${correction?.submission.sheet.type}`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`Rated by: ${correction?.corrector.name}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Rated at: ${correction?.location.name}`}
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
