import {Model, attr, fk, oneToOne} from "redux-orm";

export default class Task extends Model {}

Task.modelName = 'Task';
Task.fields = {
  name: attr(),
  maxPoints: attr(),
  parent: fk('Task')
};
