/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import RateableTaskView from './RateableTaskView';
import Task from '../../model/Task';
import Rating from '../../model/Rating';
import ParentTaskView from './ParentTaskView';
import {
  isParentTask,
  isRateableTask,
  isSingleChoiceTask,
} from '../../utils/TaskUtil';
import SingleChoiceTaskView from './SingleChoiceTaskView';

type TaskCorrectionProps = {
  task: Task;
  ratings: Rating[];
  type: string;
};

function TaskCorrection(props: TaskCorrectionProps) {
  const { type, task, ratings } = props;

  if (isParentTask(task)) {
    return <ParentTaskView task={task} type={type} ratings={ratings} />;
  }
  if (isRateableTask(task)) {
    const rating = ratings.find((r) => r.task.id === task.id);
    if (rating) {
      return (
        <RateableTaskView
          key={task.id}
          task={task}
          type={type}
          rating={rating}
        />
      );
    }
    return <></>;
  }
  if (isSingleChoiceTask(task)) {
    const rating = ratings.find((r) => r.task.id === task.id);
    if (rating) {
      return (
        <SingleChoiceTaskView
          key={task.id}
          task={task}
          type={type}
          rating={rating}
        />
      );
    }
    return <></>;
  }
  return <></>;
}

export default TaskCorrection;
