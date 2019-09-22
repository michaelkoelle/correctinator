import Model from './Model';

export default class Submission extends Model {
  constructor(id, filePaths, exercise) {
    super();
    this.id = id;
    this.filePaths = filePaths;
    this.exercise = exercise
  }
}
