import Submission from './Submission';

export default class SubmissionCorrection extends Submission {
  constructor(state, annotation, ratingFilePath, filePaths, exercise, ratings) {
    super(SubmissionCorrection.incrementId(), filePaths, exercise);
    this.state = state;
    this.annotation = annotation;
    this.ratingFilePath = ratingFilePath;
    this.ratings = ratings;
  }
}
