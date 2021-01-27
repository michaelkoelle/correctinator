import ParentTask from '../model/ParentTask';
import ParentTaskEntity from '../model/ParentTaskEntity';
import Task from '../model/Task';
import TaskEntity from '../model/TaskEntity';

export function isParentTaskEntity(t: TaskEntity): t is ParentTaskEntity {
  return (t as ParentTaskEntity).tasks !== undefined;
}

export function isParentTask(t: Task): t is ParentTask {
  return (t as ParentTask).tasks !== undefined;
}

export function hasTaskEntitiesWithZeroMax(ts: TaskEntity[]): boolean {
  return (
    ts.find((t) => {
      if (isParentTaskEntity(t)) {
        return false;
      }
      return t.max === 0;
    }) !== undefined
  );
}

export function hasTasksWithZeroMax(ts: Task[]): boolean {
  return (
    ts.find((t) => {
      if (isParentTask(t)) {
        return false;
      }
      return t.max === 0;
    }) !== undefined
  );
}

export function getTopLevelTasks(tasks: Task[]): Task[] {
  const top: Task[] = [];

  tasks.forEach((t1) => {
    let hit = false;
    tasks.forEach((t2) => {
      if (
        isParentTask(t2) &&
        t2.tasks.find((t) => t.id === t1.id) !== undefined
      ) {
        hit = true;
      }
    });
    if (!hit) {
      top.push(t1);
    }
  });

  return top;
}

export function removeTaskIds(tasks: Task[], res: any = []) {
  tasks.forEach((t) => {
    if (isParentTask(t)) {
      const { id, ...rest } = t;
      const temp: any = { ...rest };
      temp.tasks = removeTaskIds(t.tasks);
      res.push(temp);
    } else {
      const { id, ...rest } = t;
      const temp = { ...rest };
      res.push(temp);
    }
  });
  return res;
}
