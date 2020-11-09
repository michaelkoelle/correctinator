/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-no-duplicate-props */
import {
  Box,
  Card,
  Collapse,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import React, { useCallback, useMemo } from 'react';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import TaskCorrectionList from './TaskCorrectionList';
import { sumParam } from '../../utils/FileAccess';
import TaskCorrectionRating from './TaskCorrectionRating';
import TaskCorrectionParent from './TaskCorrectionParent';

function TaskCorrection(props: any) {
  const { type, task, acOptionsArray, setTask, setTasks } = props;

  /*
  const getCommentsForTask = useCallback(
    (tsk, subs, comments: string[] = []): string[] => {
      subs?.forEach((t) => {
        if (t?.id === tsk?.id && t?.comment?.trim().length > 0) {
          comments.push(t.comment);
        } else if (t?.tasks?.length > 0) {
          getCommentsForTask(tsk, t?.tasks, comments);
        }
      });
      return [...new Set(comments)];
    },
    []
  );
  */

  const onChangeComment = useCallback(
    (_event, value) => {
      const temp = { ...task };
      temp.comment = value;
      setTask([temp]);
    },
    [setTask, task]
  );

  const handleChange = useCallback(
    (e) => {
      const temp = { ...task };
      const { name, value } = e.target;
      temp[name] = value;

      // Make sure that value <= max
      if (name === 'max' || name === 'value') {
        temp.value = Math.min(temp.value, temp.max);
      }

      setTask([temp]);
    },
    [setTask, task]
  );

  const acOptions = useMemo(() => acOptionsArray[task.id], [
    acOptionsArray,
    task.id,
  ]);

  if (task.tasks.length > 0) {
    return (
      <TaskCorrectionParent
        task={task}
        setTask={setTask}
        setTaskParent={setTask}
        type={type}
        acOptionsArray={acOptionsArray}
        setTasks={setTasks}
      />
    );
  }

  return (
    <TaskCorrectionRating
      task={task}
      acOptions={acOptions}
      handleChange={handleChange}
      onChangeComment={onChangeComment}
      type={type}
    />
  );
}

export default React.memo(TaskCorrection);
