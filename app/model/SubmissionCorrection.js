import Submission from './Submission';
import {Model, attr, fk} from "redux-orm";


export default class SubmissionCorrection extends Submission {}

SubmissionCorrection.modelName = 'SubmissionCorrection';
SubmissionCorrection.fields = {
  state: attr(),
  annotation: attr(),
  ratingFilePath: attr(),
};
