/* eslint-disable jest/no-export */
import React from 'react';
import CommentEntity from '../../model/CommentEntity';
import Rating from '../../model/Rating';
import RatingEntity from '../../model/RatingEntity';
import Task from '../../model/Task';
import { getTopLevelTasks, isParentTask } from '../../utils/TaskUtil';
import SchemaParentTask from './SchemaParentTask';
import SchemaRateableTask from './SchemaRateableTask';

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
  /*
  const tasks: Task[] = useSelector(selectAllTasks);
  const schema: Schema = useSelector(selectSchema);
  const schemaTasks: Task[] = denormalizeTasks(schema.tasks, tasks);


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
    t.forEach((task: Task) => {
      if (isParentTask(task)) {
        tasksToRender.push(
          <SchemaParentTask
            key={task.id}
            task={task}
            ratings={ratings}
            depth={depth}
            type={type}
          />
        );
        if (task.tasks.length > 0) {
          generateTemplates(task.tasks as Task[], depth + 1);
        }
      } else {
        const rating = ratingEntities.find((r) => r.task === task.id);
        const comment = comments.find((c) => c.task === task.id);
        if (rating && comment) {
          tasksToRender.push(
            <SchemaRateableTask
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
