import Model from './Model';

export default class Comment extends Model {
  constructor(text, rating) {
    super();
    this.id = Comment.incrementId();
    this.rating = rating;
    this.text = text;
  }
}
