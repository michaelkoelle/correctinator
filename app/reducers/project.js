// @flow

import fs from "fs";
import path from "path";
import thunk from 'redux-thunk';
import { loadSubmissions, setLastOpen, setSubmissions } from '../actions/actionCreators';
import { parse } from '../utils/UniworxParser';
import { getAllFilesInDirectory, openDirectory } from '../utils/FileAccess';
import type { Action } from './types';

import {
  ADD_SUBMISSION,
  SET_LAST_OPEN,
  SET_SUBMISSIONS,
  SET_CURRENT_ROW,
  NEXT_SUBMISSION,
  PREV_SUBMISSION,
  OPEN_SUBMISSIONS,
  LOAD_SUBMISSIONS
} from '../constants/actionTypes';

export default function project(state = {path: "", current: 0}, action: Action) {
  switch (action.type) {

    case OPEN_SUBMISSIONS: {
      return state;
    }


    case LOAD_SUBMISSIONS: {
      return state;
    }


    case SET_LAST_OPEN:
      return Object.assign({}, state, {
        path: action.path
      });


    case SET_SUBMISSIONS:
      return Object.assign({}, state, {
        submissions: action.submissions
      });


    case ADD_SUBMISSION:
      return Object.assign({}, state, {
        submissions: [...state.submissions, action.submission]
      });


    case SET_CURRENT_ROW:
      return Object.assign({}, state, {
        current: action.rowMeta
      });


    case NEXT_SUBMISSION:
      if(state.current < state.submissions.length-1){
        return Object.assign({}, state, {
          current: state.current + 1
        });
      }
      return state;


    case PREV_SUBMISSION:
      if(state.current > 0){
        return Object.assign({}, state, {
          current: state.current - 1
        });
      }
      return state;


    default:
      return state;
  }
}
