// @flow

import { SET_SUBMISSIONS } from '../constants/actionTypes';

export default function db(state = {}, action: Action) {
  switch (action.type) {
    case SET_SUBMISSIONS:
      return action.submissions;

    default:
      return state;
  }
}
