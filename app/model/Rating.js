import {Model, attr, fk} from "redux-orm";

export default class Rating extends Model {}
Rating.modelName = 'Rating';
Rating.fields = {
  score: attr(),
  commentId: fk('Comment'),
  taskId: fk('Task'),
  correctorId: fk('Corrector'),
  submissionId: fk('Submission')
};
