import { Paper, Box } from '@material-ui/core';
import React from 'react';
import TaskCorrectionList from './TaskCorrectionList';

export default function TaskView(props: any) {
  const { tasks = [], setTasks, corrections, correction } = props;
  return (
    <Paper style={{ flex: '1 1 0%', overflowY: 'auto', padding: '0px' }}>
      <Box flex="1 1 0%" overflow="auto">
        <TaskCorrectionList
          tasks={tasks}
          setTasks={setTasks}
          corrections={corrections}
          correction={correction}
        />
      </Box>
    </Paper>
  );
}
