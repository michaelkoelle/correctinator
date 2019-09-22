import Model from './Model';

export default class Task extends Model {
  constructor(name, maxPoints, parent, subTasks) {
    super();
    this.id = Task.incrementId();
    this.name = name;
    this.maxPoints = maxPoints;
    this.parent = parent;
    this.subTasks = subTasks;
  }
}
