import { Model, attr, fk } from "redux-orm";

export default class Lecture extends Model {}
Lecture.modelName = 'Lecture';
Lecture.fields = {
  name: attr()
};
