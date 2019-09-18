import { Model, fk, many, oneToOne, attr } from 'redux-orm';

export class Correction extends Model {}
Correction.modelName = 'Correction';
Correction.fields = {
  id: attr(),
  state: attr(),
  ratings: attr(),
  comments: attr(),
  lecture: attr(),
  exercise: attr(),
  annotation: attr(),
  notes: attr(),


};

export class Corrector extends Model {}
Corrector.modelName = 'Corrector';
Corrector.fields = {
  id: attr(),
  name: attr(),
  email: attr(),
};

export class Comment extends Model {}
Comment.modelName = 'Comment';
Comment.fields = {
  id: attr(),
  text: attr(),
  author: fk("Corrector"),
  task: fk("Task"),
  correction: fk("Correction"),
};

export class Task extends Model {}
Task.modelName = 'Task';
Task.fields = {
  id: attr(),
  name: attr(),
  maxPoints: attr(),
  subtasks: many('Task')
};

