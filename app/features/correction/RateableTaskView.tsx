/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  TextField,
  Typography,
  Card,
  Grid,
  Tooltip,
  IconButton,
} from '@material-ui/core';
import { CheckCircleOutline, HighlightOff } from '@material-ui/icons';
import React from 'react';
import { useDispatch } from 'react-redux';
import { commentsUpdateOne } from '../../model/CommentSlice';
import RateableTask from '../../model/RateableTask';
import Rating from '../../model/Rating';
import { ratingsUpdateOne } from '../../model/RatingSlice';
import TaskCommentInput from './TaskCommentInput';

type RateableTaskViewProps = {
  task: RateableTask;
  rating: Rating;
  type: string;
};

function RateableTaskView(props: RateableTaskViewProps) {
  const { task, type, rating } = props;
  const dispatch = useDispatch();

  function onChangeValue(e) {
    const newValue = parseFloat(e.target.value);
    dispatch(
      ratingsUpdateOne({
        id: rating.id,
        changes: { value: Math.min(newValue, task.max) },
      })
    );
  }

  function onSetToMaxPoints() {
    dispatch(
      ratingsUpdateOne({
        id: rating.id,
        changes: { value: task.max },
      })
    );
    dispatch(
      commentsUpdateOne({
        id: rating.comment.id,
        changes: { text: '' },
      })
    );
  }

  function onSolutionMissing() {
    dispatch(
      ratingsUpdateOne({
        id: rating.id,
        changes: { value: 0 },
      })
    );
    dispatch(
      commentsUpdateOne({
        id: rating.comment.id,
        changes: { text: 'Missing Solution' },
      })
    );
  }

  return (
    <Box width="100%">
      <Card
        style={{
          padding: '15px',
          margin: '0px',
          marginRight: '-1px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
        variant="outlined"
      >
        <Grid container spacing={2} alignItems="center" justify="space-between">
          <Grid item>
            <Typography>
              {`${task.name}${task.delimiter ? task.delimiter : ':'}`}
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justify="space-between"
            >
              <Grid item>
                <Box width="5em">
                  <TextField
                    id="value"
                    name="value"
                    type="number"
                    value={rating.value}
                    inputProps={{ min: 0, max: task.max, step: task.step }}
                    onChange={onChangeValue}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item>
                <Typography>/</Typography>
              </Grid>
              <Grid item>
                <Typography>{task.max}</Typography>
              </Grid>
              <Grid item>
                <Typography>{type}</Typography>
              </Grid>
              <Grid item>
                <Tooltip title="Full points">
                  <span>
                    <IconButton onClick={onSetToMaxPoints} size="small">
                      <CheckCircleOutline />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item style={{ marginLeft: '-15px' }}>
                <Tooltip title="Missing Solution">
                  <span>
                    <IconButton onClick={onSolutionMissing} size="small">
                      <HighlightOff />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TaskCommentInput comment={rating.comment} />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default RateableTaskView;
