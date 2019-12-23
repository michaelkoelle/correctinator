// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { createReducer } from "redux-orm";
import orm from "../orm";
import project from './project';
import ormReducer from "./ormReducer";

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    project,
    orm: createReducer(orm),
    ormReducer
  });
}
