import Task from './Task';

export default class Exercise extends Task {
  constructor(name, maxPoints, lecture, subTasks) {
    super(name, maxPoints, undefined, subTasks);
    this.lecture = lecture;
  }
}
