/* eslint-disable jest/no-export */
import React from 'react';
import CommentEntity from '../../model/CommentEntity';
import ParentTask from '../../model/ParentTask';
import RateableTask from '../../model/RateableTask';
import Rating from '../../model/Rating';
import RatingEntity from '../../model/RatingEntity';
import Task from '../../model/Task';
import {
  getTopLevelTasks,
  isParentTask,
  isRateableTask,
  isSingleChoiceTask,
} from '../../utils/TaskUtil';
import SchemaParentTask from './SchemaParentTask';
import SchemaRateableTask from './SchemaRateableTask';
import SchemaSingleChoiceTask from './SchemaSingleChoiceTask';

type TaskSchemeListProps = {
  tasks: Task[];
  ratings: Rating[];
  ratingEntities: RatingEntity[];
  comments: CommentEntity[];
  type: string;
};

export default function TaskSchemeList(props: TaskSchemeListProps) {
  const { tasks, ratings, ratingEntities, comments, type } = props;
  const tasksToRender: JSX.Element[] = [];

  function generateTemplates(t: Task[], depth = 0) {
    t.forEach((task: Task) => {
      if (isParentTask(task)) {
        tasksToRender.push(
          <SchemaParentTask
            key={task.id}
            task={task as ParentTask}
            ratings={ratings}
            depth={depth}
            type={type}
          />
        );
        if ((task as ParentTask).tasks.length > 0) {
          generateTemplates((task as ParentTask).tasks as Task[], depth + 1);
        }
      } else if (isRateableTask(task)) {
        const rating = ratingEntities.find((r) => r.task === task.id);
        const comment = comments.find((c) => c.task === task.id);
        if (rating && comment) {
          tasksToRender.push(
            <SchemaRateableTask
              key={task.id}
              task={task as RateableTask}
              rating={rating}
              comment={comment}
              depth={depth}
              type={type}
            />
          );
        }
      } else if (isSingleChoiceTask(task)) {
        const rating = ratingEntities.find((r) => r.task === task.id);
        const comment = comments.find((c) => c.task === task.id);
        if (rating && comment) {
          tasksToRender.push(
            <SchemaSingleChoiceTask
              key={task.id}
              task={task}
              rating={rating}
              comment={comment}
              depth={depth}
              type={type}
            />
          );
        }
      }
    });
  }

  generateTemplates(getTopLevelTasks(tasks));

  return <div>{tasksToRender}</div>;
}
