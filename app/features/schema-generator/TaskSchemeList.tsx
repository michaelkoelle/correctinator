/* eslint-disable jest/no-export */
import React, { useState } from 'react';
import TaskScheme from './TaskScheme';

export default function TaskSchemeList(props: any) {
  const { tasks, setTasks, selectedTask, setSelected, type } = props;

  const tasksToRender: any[] = [];

  function updateTask(tasksArray: any, task: any) {
    for (let i = 0; i < tasksArray.length; i += 1) {
      if (tasksArray[i].id === task.id) {
        tasksArray[i] = task;
        return;
      }
      updateTask(tasksArray[i].tasks, task);
    }
  }

  function setTask(task: any) {
    const temp = [...tasks];
    updateTask(temp, task);
    setTasks(temp);
  }

  function generateTemplates(t: any[], depth: number) {
    t?.forEach((task: any) => {
      tasksToRender?.push(
        <TaskScheme
          task={task}
          setTask={setTask}
          key={task.id}
          selected={selectedTask.id === task.id}
          setSelected={setSelected}
          depth={depth}
          type={type}
        />
      );
      generateTemplates(task.tasks, depth + 1);
    });
  }

  generateTemplates(tasks, 0);

  return <div>{tasksToRender}</div>;
}
