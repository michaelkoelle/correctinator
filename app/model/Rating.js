import Model from './Model';

export default class Rating extends Model {
  constructor(score, comment, task, corrector, submission) {
    super();
    this.id = Rating.incrementId();
    this.score = score;
    this.comment = comment;
    this.task = task;
    this.corrector = corrector;
    this.submission = submission;
  }
}
