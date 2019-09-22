import Model from './Model';

export default class Lecture extends Model {
  constructor(name) {
    super();
    this.id = Lecture.incrementId();
    this.name = name;
  }
}
