// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import project from './project';
import db from './db';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    project,
    db
  });
}
