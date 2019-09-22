import Model from './Model';

export default class Corrector extends Model {
  constructor(name, email) {
    super();
    this.id = Corrector.incrementId();
    this.name = name;
    this.email = email
  }
}
