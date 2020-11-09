import { Paper, Box } from '@material-ui/core';
import React, { useCallback, useMemo } from 'react';
import TaskCorrectionList from './TaskCorrectionList';

function TaskView(props: any) {
  const { tasks = [], setTasks, corrections, correction } = props;

  const getCommentsForTask = useCallback(
    (tsks: any[], comments: any[] = []): any[] => {
      tsks?.forEach((ts) => {
        ts?.forEach((tsk) => {
          if (tsk?.comment?.trim().length > 0) {
            if (comments[tsk.id] === undefined) {
              comments[tsk.id] = [tsk?.comment];
            } else {
              comments[tsk.id].push(tsk?.comment);
            }
          } else if (tsk?.tasks?.length > 0) {
            getCommentsForTask([tsk?.tasks], comments);
          }
        });
      });
      return comments;
    },
    []
  );

  const acOptionsArray = useMemo(
    () => getCommentsForTask(corrections.map((t) => t.tasks)),
    [corrections, getCommentsForTask]
  );

  return (
    <Paper style={{ flex: '1 1 0%', overflowY: 'auto', padding: '0px' }}>
      <Box flex="1 1 0%" overflow="auto">
        <TaskCorrectionList
          tasks={tasks}
          setTasks={setTasks}
          acOptionsArray={acOptionsArray}
          type={correction?.sheet?.grading?.type}
        />
      </Box>
    </Paper>
  );
}

export default React.memo(TaskView);
