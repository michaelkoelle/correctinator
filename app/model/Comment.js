import { Model, fk, many, attr } from 'redux-orm';
import {CREATE_COMMENT, DELETE_COMMENT, UPDATE_COMMENT} from "../constants/actionTypes";

export default class Comment extends Model {
  static reducer(state, action, model, session) {
    const { payload, type } = action;
    switch (type) {
      case CREATE_COMMENT:
        Comment.create(payload);
        break;
      case UPDATE_COMMENT:
        Comment.withId(payload.id).update(payload.props);
        break;
      case DELETE_COMMENT:
        Comment.withId(payload).delete();
        break;
      default:
    }
    return model.getNextState();
  }
}

Comment.modelName = 'Comment';
Comment.fields = {
  text: attr(),
};
