import { Paper, Box, Typography, Grid } from '@material-ui/core';
import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import TaskListView from './TaskListView';

type TaskViewProps = {
  tasks: Task[] | undefined;
  ratings: Rating[] | undefined;
  type: string;
};

function TaskView(props: TaskViewProps) {
  const { tasks, ratings, type } = props;

  return (
    <Paper style={{ flex: '1 1 0%', overflowY: 'auto', padding: '0px' }}>
      {tasks && ratings ? (
        <Box flex="1 1 0%" overflow="auto">
          <TaskListView tasks={tasks} ratings={ratings} type={type} />
        </Box>
      ) : (
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          style={{ height: '100%' }}
        >
          <Grid item>
            <ErrorIcon />
          </Grid>
          <Grid item>
            <Typography>No tasks found!</Typography>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}

export default TaskView;
