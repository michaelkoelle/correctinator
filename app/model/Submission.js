import {Model, attr, fk} from "redux-orm";
import Comment from "./Comment";

export default class Submission extends Model {}

Submission.modelName = 'Submission';
Submission.fields = {
  filePaths: attr(),
  exerciseId: fk('Exercise'),
};
