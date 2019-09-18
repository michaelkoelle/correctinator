import { schema } from 'normalizr';


export const comment = new schema.Entity('comments');
export const score = new schema.Entity('scores');
export const task = new schema.Entity('tasks',{
  rating: score,
  comment: comment
});
const tasks = new schema.Array(task);
task.define({ tasks });

export const corrector = new schema.Entity('correctors');

export const correction = new schema.Entity('tasks',{
  corrector: corrector,
  comment: comment,
  tasks: tasks
});




