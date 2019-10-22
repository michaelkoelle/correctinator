import { Model, attr } from "redux-orm";
import { CREATE_CORRECTOR, DELETE_CORRECTOR, UPDATE_CORRECTOR } from "../constants/actionTypes";

export default class Corrector extends Model {
  static reducer(state, action, model, session) {
    const { payload, type } = action;
    switch (type) {
      case CREATE_CORRECTOR:
        Corrector.create(payload);
        break;
      case UPDATE_CORRECTOR:
        Corrector.withId(payload.id).update(payload.props);
        break;
      case DELETE_CORRECTOR:
        Corrector.withId(payload).delete();
        break;
      default:
    }
    return model.getNextState();
  }
}

Corrector.modelName = 'Corrector';
Corrector.fields = {
  name: attr(),
  email: attr()
};
