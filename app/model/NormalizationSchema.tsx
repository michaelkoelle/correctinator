/* eslint-disable import/prefer-default-export */
import { schema } from 'normalizr';
import Correction from './Correction';
import Sheet from './Sheet';

export const TaskSchema = new schema.Entity('tasks');
export const TasksSchema = new schema.Array(TaskSchema);
TaskSchema.define({
  tasks: TasksSchema,
  comment: new schema.Entity('comments'),
});

export const correctionSchema = new schema.Entity(
  'corrections',
  {
    term: new schema.Entity('terms', {}, { idAttribute: 'name' }),
    school: new schema.Entity('schools', {}, { idAttribute: 'name' }),
    course: new schema.Entity('courses', {}, { idAttribute: 'name' }),
    sheet: new schema.Entity('sheets', {}),
    corrector: new schema.Entity('correctors', {}, { idAttribute: 'name' }),
    location: new schema.Entity('locations', {}, { idAttribute: 'name' }),
    tasks: TasksSchema,
  },
  { idAttribute: 'submission' }
);

export const correctionsSchema = new schema.Array(correctionSchema);
