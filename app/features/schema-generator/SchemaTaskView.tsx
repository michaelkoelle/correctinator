/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import { Typography } from '@material-ui/core';
import Task from '../../model/Task';
import Rating from '../../model/Rating';
import {
  isParentTask,
  isRateableTask,
  isSingleChoiceTask,
} from '../../utils/TaskUtil';
import SchemaParentTask from './SchemaParentTask';
import SchemaRateableTask from './SchemaRateableTask';
import SchemaSingleChoiceTask from './SchemaSingleChoiceTask';
import SchemaTaskCard from './SchemaTaskCard';

type SchemaTaskViewProps = {
  task: Task;
  ratings: Rating[];
  type: string;
  depth: number;
};

export default function SchemaTaskView(props: SchemaTaskViewProps) {
  const { type, task, ratings, depth } = props;
  const rating = ratings.find((r) => r.task.id === task.id);
  let taskComp;

  if (isParentTask(task)) {
    taskComp = (
      <SchemaParentTask
        task={task}
        type={type}
        ratings={ratings}
        depth={depth}
      />
    );
  } else if (rating && isRateableTask(task)) {
    taskComp = (
      <SchemaRateableTask
        key={task.id}
        task={task}
        type={type}
        rating={rating}
      />
    );
  } else if (rating && isSingleChoiceTask(task)) {
    taskComp = (
      <SchemaSingleChoiceTask
        key={task.id}
        task={task}
        type={type}
        rating={rating}
      />
    );
  } else {
    taskComp = <Typography>Error: Unknown task type</Typography>;
  }

  return (
    <SchemaTaskCard task={task} depth={depth}>
      {taskComp}
    </SchemaTaskCard>
  );
}
