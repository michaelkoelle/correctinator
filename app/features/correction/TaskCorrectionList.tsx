/* eslint-disable import/no-cycle */
import { List, ListItem } from '@material-ui/core';
import React from 'react';
import TaskCorrection from './TaskCorrection';

export default function TaskCorrectionList(props: any) {
  const {
    tasks,
    setTaskParent = undefined,
    setTasks,
    disableGutters = false,
  } = props;

  function updateTask(tasksArray: any, tasksToUpdate: any[]) {
    tasksToUpdate.forEach((task) => {
      for (let i = 0; i < tasksArray.length; i += 1) {
        if (tasksArray[i].id === task.id) {
          tasksArray[i] = task;
          return;
        }
        updateTask(tasksArray[i].tasks, [task]);
      }
    });
  }

  function setTask(task: any[]) {
    const temp = [...tasks];
    updateTask(temp, task);
    if (setTaskParent !== undefined) {
      setTaskParent(temp);
    } else {
      setTasks(temp);
    }
  }

  return (
    <List style={{ paddingBottom: disableGutters ? 0 : undefined }}>
      {tasks.map((t: any, i: number, a: any[]) => {
        return (
          <ListItem
            key={t?.id}
            disableGutters={disableGutters}
            style={{ paddingBottom: a?.length === i + 1 ? 0 : undefined }}
          >
            <TaskCorrection
              task={t}
              setTask={setTask}
              setTaskParent={setTaskParent}
              setTasks={setTasks}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
