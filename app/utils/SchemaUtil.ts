import { v4 as uuidv4 } from 'uuid';
import Task from '../model/Task';
import RatingEntity from '../model/RatingEntity';
import CommentEntity from '../model/CommentEntity';
import { isParentTask } from './TaskUtil';
import ParentTaskEntity from '../model/ParentTaskEntity';
import TaskEntity from '../model/TaskEntity';

export function mapTasks<T>(
  tl: Task[],
  rl: RatingEntity[],
  cl: CommentEntity[],
  func: (task: Task, rating?: RatingEntity, comment?: CommentEntity) => T,
  parentTaskList: T[] = []
) {
  tl.forEach((t) => {
    let task: any;
    if (isParentTask(t)) {
      task = func(t);
      task.tasks = mapTasks(t.tasks, rl, cl, func, []);
    } else {
      const r = rl.find((ra) => ra.task === t.id);
      const c = cl.find((co) => co.task === t.id);

      if (!r || !c) {
        return;
      }
      task = func(t, r, c);
    }
    parentTaskList.push(task);
  });

  return parentTaskList;
}

export function mapSchemaTask<T extends { tasks?: T[] }>(
  ts: T[],
  func: (t: T) => { t: TaskEntity; r?: RatingEntity; c?: CommentEntity },
  subtasks: string[] = [],
  taskList: TaskEntity[] = [],
  ratingList: RatingEntity[] = [],
  commentList: CommentEntity[] = []
) {
  ts.forEach((tsk) => {
    const entities: {
      t: TaskEntity;
      r?: RatingEntity;
      c?: CommentEntity;
    } = func(tsk);
    if (tsk.tasks !== undefined && tsk.tasks.length > 0) {
      (entities.t as ParentTaskEntity).tasks = mapSchemaTask(
        tsk.tasks,
        func,
        [],
        taskList,
        ratingList,
        commentList
      ).subtasks;
    }
    taskList.push(entities.t);
    subtasks.push(entities.t.id);
    if (entities.r) ratingList.push(entities.r);
    if (entities.c) commentList.push(entities.c);
  });
  return {
    entities: { tasks: taskList, ratings: ratingList, comments: commentList },
    subtasks,
  };
}

export function parseSchemaTasks<T>(
  ts: T[]
): { tasks: TaskEntity[]; ratings: RatingEntity[]; comments: CommentEntity[] } {
  const func = (t): { t: TaskEntity; r?: RatingEntity; c?: CommentEntity } => {
    const { name, value, text, tasks, ...rest } = t;
    const task: TaskEntity = {
      id: uuidv4(),
      name: name.substring(0, name.length - 1),
      delimiter: name.substring(name.length - 1),
      tasks: tasks?.map((tsk: any) => tsk.id),
      ...rest,
    };

    let comment: CommentEntity | undefined;
    let rating: RatingEntity | undefined;

    if ((task as ParentTaskEntity).tasks === undefined) {
      comment = {
        id: uuidv4(),
        text: text ?? '',
        task: task.id,
      };

      rating = {
        id: uuidv4(),
        value: value ?? 0,
        task: task.id,
        comment: comment.id,
      };
    }

    return { t: task, r: rating, c: comment };
  };
  return mapSchemaTask(ts, func).entities;
}

export function stringifySchemaTasks(
  tasks: Task[],
  ratings: RatingEntity[],
  comments: CommentEntity[]
) {
  const func = (t: Task, r?: RatingEntity, c?: CommentEntity) => {
    const { id, name, delimiter, ...rest } = t;
    if (!r || !c) {
      return { name: name + (delimiter ?? ''), ...rest };
    }
    const { value } = r;
    const { text } = c;
    return {
      name: name + (delimiter ?? ''),
      value,
      text: !text ? undefined : text,
      ...rest,
    };
  };
  return mapTasks<any>(tasks, ratings, comments, func);
}
