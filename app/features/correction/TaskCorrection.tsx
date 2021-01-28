/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import RateableTaskView from './RateableTaskView';
import Task from '../../model/Task';
import Rating from '../../model/Rating';
import { isParentTask } from '../../utils/TaskUtil';
import ParentTaskView from './ParentTaskView';

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
  const rating = ratings.find((r) => r.task.id === task.id);
  if (rating) {
    return (
      <RateableTaskView key={task.id} task={task} type={type} rating={rating} />
    );
  }
  return <></>;
}

export default TaskCorrection;
