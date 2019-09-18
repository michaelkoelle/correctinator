// @flow
import type { GetState, Dispatch } from '../reducers/types';
import {
  SET_LAST_OPEN,
  SET_SUBMISSIONS,
  ADD_SUBMISSION,
  SET_CURRENT_SUBMISSION,
  SET_CURRENT_ROW, NEXT_SUBMISSION, PREV_SUBMISSION
} from '../constants/actionTypes';

export function setLastOpen(path) {
  return {
    type: SET_LAST_OPEN,
    path
  };
}

export function setSubmissions(submissions) {
  return {
    type: SET_SUBMISSIONS,
    submissions
  };
}

export function addSubmision(submission) {
  return {
    type: ADD_SUBMISSION,
    submission
  };
}

export function setCurrentRow(rowMeta) {
  return {
    type: SET_CURRENT_ROW,
    rowMeta
  };
}

export function nextSubmission() {
  return {
    type: NEXT_SUBMISSION,
  };
}

export function prevSubmission() {
  return {
    type: PREV_SUBMISSION,
  };
}


