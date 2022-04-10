/* eslint-disable import/no-cycle */
import {
  Box,
  Typography,
  Card,
  Grid,
  IconButton,
  Collapse,
  Tooltip,
} from '@material-ui/core';
import {
  CheckCircleOutline,
  ExpandLess,
  ExpandMore,
  HighlightOff,
} from '@material-ui/icons';
import React from 'react';
import { useDispatch } from 'react-redux';
import { commentsUpdateOne } from '../../slices/CommentSlice';
import ParentTask from '../../model/ParentTask';
import Rating from '../../model/Rating';
import { ratingsUpdateOne } from '../../slices/RatingSlice';
import {
  getMaxValueForTasks,
  getRatingValueForTasks,
} from '../../utils/Formatter';
import {
  flatMapTask,
  isRateableTask,
  isSingleChoiceTask,
} from '../../utils/TaskUtil';
import TaskCorrectionList from './TaskListView';

type ParentTaskViewProps = {
  task: ParentTask;
  ratings: Rating[];
  type: string;
};

function ParentTaskView(props: ParentTaskViewProps) {
  const { task, ratings, type } = props;
  const [expanded, setExpanded] = React.useState(true);

  const dispatch = useDispatch();
  const max = getMaxValueForTasks(task.tasks);
  const value = getRatingValueForTasks(task.tasks, ratings);

  const onExpand = () => {
    setExpanded(!expanded);
  };

  function onSetToMaxPoints() {
    const tasks = flatMapTask(task);
    ratings
      .filter((r) => tasks.map((t) => t.id).includes(r.task.id))
      .forEach((r) => {
        if (isRateableTask(r.task)) {
          dispatch(
            ratingsUpdateOne({
              id: r.id,
              changes: { value: r.task.max },
            })
          );
          dispatch(
            commentsUpdateOne({
              id: r.comment.id,
              changes: { text: '' },
            })
          );
        } else if (isSingleChoiceTask(r.task)) {
          dispatch(
            ratingsUpdateOne({
              id: r.id,
              changes: { value: r.task.answer.value },
            })
          );
        }
      });
  }

  function onSolutionMissing() {
    const tasks = flatMapTask(task);
    ratings
      .filter((r) => tasks.map((t) => t.id).includes(r.task.id))
      .forEach((rating) => {
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
      });
  }

  return (
    <Box width="100%">
      <Card
        style={{
          padding: '15px',
          paddingRight: '0px',
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
                <Typography>{value}</Typography>
              </Grid>
              <Grid item>
                <Typography>/</Typography>
              </Grid>
              <Grid item>
                <Typography>{max}</Typography>
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
              <Grid item>
                <IconButton
                  onClick={onExpand}
                  aria-label="show more"
                  size="small"
                >
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <TaskCorrectionList
            type={type}
            tasks={task?.tasks}
            ratings={ratings}
            disableGutters
          />
        </Collapse>
      </Card>
    </Box>
  );
}

export default ParentTaskView;
