/* eslint-disable import/no-cycle */
import { List, ListItem } from '@material-ui/core';
import React, { useCallback } from 'react';
import TaskCorrection from './TaskCorrection';

function TaskCorrectionList(props: any) {
  const {
    tasks,
    disableGutters = false,
    type,
    setTasks,
    setTaskParent = undefined,
    acOptionsArray,
  } = props;

  const updateTask = useCallback((tasksArray: any, tasksToUpdate: any[]) => {
    tasksToUpdate.forEach((task) => {
      for (let i = 0; i < tasksArray.length; i += 1) {
        if (tasksArray[i].id === task.id) {
          tasksArray[i] = task;
          return;
        }
        updateTask(tasksArray[i].tasks, [task]);
      }
    });
  }, []);

  const setTask = useCallback(
    (task: any[]) => {
      const temp = [...tasks];
      updateTask(temp, task);
      if (setTaskParent !== undefined) {
        setTaskParent(temp);
      } else {
        setTasks(temp);
      }
    },
    [setTaskParent, setTasks, tasks, updateTask]
  );

  return (
    <List style={{ paddingBottom: disableGutters ? 0 : undefined }}>
      {tasks?.map((t: any, i: number, a: any[]) => {
        return (
          <ListItem
            key={t?.id}
            disableGutters={disableGutters}
            style={{
              paddingBottom: a?.length === i + 1 ? 0 : undefined,
            }}
          >
            <TaskCorrection
              task={t}
              acOptionsArray={acOptionsArray}
              type={type}
              setTasks={setTasks}
              setTask={setTask}
            />
          </ListItem>
        );
      })}
    </List>
  );
}

export default React.memo(TaskCorrectionList);
