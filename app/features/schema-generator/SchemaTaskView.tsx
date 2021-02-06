/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
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

type SchemaTaskViewProps = {
  task: Task;
  ratings: Rating[];
  type: string;
  depth: number;
};

export default function SchemaTaskView(props: SchemaTaskViewProps) {
  const { type, task, ratings, depth } = props;

  if (isParentTask(task)) {
    return (
      <SchemaParentTask
        task={task}
        type={type}
        ratings={ratings}
        depth={depth}
      />
    );
  }
  if (isRateableTask(task)) {
    const rating = ratings.find((r) => r.task.id === task.id);
    if (rating) {
      return (
        <SchemaRateableTask
          key={task.id}
          task={task}
          type={type}
          rating={rating}
          depth={depth}
        />
      );
    }
    return <></>;
  }
  if (isSingleChoiceTask(task)) {
    const rating = ratings.find((r) => r.task.id === task.id);
    if (rating) {
      return (
        <SchemaSingleChoiceTask
          key={task.id}
          task={task}
          type={type}
          rating={rating}
          depth={depth}
        />
      );
    }
    return <></>;
  }
  return <></>;
}
