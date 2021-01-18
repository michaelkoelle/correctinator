/* eslint-disable jest/no-export */
import { denormalize } from 'normalizr';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Schema from '../../model/Schema';
import { selectSchema } from '../../model/SchemaSlice';
import Sheet from '../../model/Sheet';
import { selectAllSheets } from '../../model/SheetSlice';
import Task from '../../model/TaskEntity';
import { selectAllTasks } from '../../model/TaskSlice';
import { denormalizeTasks } from '../../utils/FileAccess';
import TaskScheme from './TaskScheme';

export default function TaskSchemeList(props: any) {
  const tasks: Task[] = useSelector(selectAllTasks);
  const schema: Schema = useSelector(selectSchema);
  const schemaTasks: Task[] = denormalizeTasks(schema.tasks, tasks);
  const tasksToRender: any[] = [];

  /*
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

  */

  function generateTemplates(t: Task[], depth = 0) {
    t?.forEach((task: Task | undefined) => {
      if (task !== undefined) {
        tasksToRender?.push(
          <TaskScheme
            task={task}
            // setTask={setTask}
            key={task.id}
            // selected={selectedTask.id === task.id}
            // setSelected={setSelected}
            depth={depth}
            // type={type}
          />
        );

        if (task.tasks.length > 0) {
          generateTemplates(task.tasks as Task[], depth + 1);
        }
      }
    });
  }

  generateTemplates(schemaTasks);

  return <div>{tasksToRender}</div>;
}
