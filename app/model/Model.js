export default class Model {
  static incrementId() {
    if (this.latestId === undefined) this.latestId = 0;
    else this.latestId = this.latestId + 1;
    return this.latestId
  }
}
