// @flow
import fs from "fs";
import path from "path";

import {
  SET_LAST_OPEN,
  SET_SUBMISSIONS,
  ADD_SUBMISSION,
  SET_CURRENT_ROW,
  NEXT_SUBMISSION,
  PREV_SUBMISSION,
  CREATE_SUBMISSION_CORRECTION,
  CREATE_COMMENT,
  CREATE_CORRECTOR,
  CREATE_EXERCISE,
  CREATE_LECTURE,
  UPDATE_SUBMISSION_CORRECTION,
  DELETE_SUBMISSION_CORRECTION,
  DELETE_COMMENT,
  UPDATE_COMMENT,
  UPDATE_CORRECTOR,
  DELETE_CORRECTOR,
  UPDATE_EXERCISE,
  DELETE_EXERCISE,
  DELETE_LECTURE,
  UPDATE_LECTURE,
  CREATE_RATING,
  UPDATE_RATING,
  DELETE_RATING, CREATE_SUBMISSION, DELETE_SUBMISSION, UPDATE_SUBMISSION, DELETE_TASK, UPDATE_TASK, CREATE_TASK
} from '../constants/actionTypes';
import { getAllFilesInDirectory, openDirectory } from '../utils/FileAccess';
import { parse } from '../utils/UniworxParser';

const ratingFilePattern = new RegExp('bewertung_([0-9]+)\\.txt', 'g');

/*
export function openSubmissions() {
  return {
    type: OPEN_SUBMISSIONS,
  };
}
 */

export function openSubmissions() {
  return (dispatch) => {
    const dirPath = openDirectory();
    if(dirPath){
      dispatch(setLastOpen(dirPath));
      dispatch(loadSubmissions(dirPath));
    }else{
      // TODO error
    }
  }
}

export function loadSubmissions(dirPath) {
  return (dispatch) => {
    const ratingFiles = getAllFilesInDirectory(dirPath).filter(file => file.match(ratingFilePattern)).map(file => path.normalize(file));

    const submissions = [];

    ratingFiles.forEach(ratingFile => {
      const directory = path.normalize(path.dirname(ratingFile));
      const files = getAllFilesInDirectory(directory).filter(file => !file.match(ratingFilePattern)).map(file => path.normalize(file));
      submissions.push(parse(fs.readFileSync(ratingFile, 'utf8').replace(/\r/g, ''), directory, ratingFile, files));
    });
    /*
    if(submissions.length > 0){
      dispatch(setSubmissions(normalize(submissions, stateSchema)));
    }
    */
  }
}


export function setLastOpen(dirPath) {
  return {
    type: SET_LAST_OPEN,
    path: dirPath
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



export function createSubmissionCorrection(props) {
  return {
    type: CREATE_SUBMISSION_CORRECTION,
    payload: props
  };
}

export function updateSubmissionCorrection(id, props) {
  return {
    type: UPDATE_SUBMISSION_CORRECTION,
    payload: {id, props}
  };
}

export function deleteSubmissionCorrection(id) {
  return {
    type: DELETE_SUBMISSION_CORRECTION,
    payload: id
  };
}

export function createComment(props) {
  return {
    type: CREATE_COMMENT,
    payload: props
  };
}

export function updateComment(id, props) {
  return {
    type: UPDATE_COMMENT,
    payload: {id, props}
  };
}

export function deleteComment(id) {
  return {
    type: DELETE_COMMENT,
    payload: id
  };
}

export function createCorrector(props) {
  return {
    type: CREATE_CORRECTOR,
    payload: props
  };
}

export function updateCorrector(id, props) {
  return {
    type: UPDATE_CORRECTOR,
    payload: {id, props}
  };
}

export function deleteCorrector(id) {
  return {
    type: DELETE_CORRECTOR,
    payload: id
  };
}

export function createExercise(props) {
  return {
    type: CREATE_EXERCISE,
    payload: props
  };
}

export function updateExercise(id, props) {
  return {
    type: UPDATE_EXERCISE,
    payload: {id, props}
  };
}

export function deleteExercise(id) {
  return {
    type: DELETE_EXERCISE,
    payload: id
  };
}

export function createLecture(props) {
  return {
    type: CREATE_LECTURE,
    payload: props
  };
}

export function updateLecture(id, props) {
  return {
    type: UPDATE_LECTURE,
    payload: {id, props}
  };
}

export function deleteLecture(id) {
  return {
    type: DELETE_LECTURE,
    payload: id
  };
}

export function createRating(props) {
  return {
    type: CREATE_RATING,
    payload: props
  };
}

export function updateRating(id, props) {
  return {
    type: UPDATE_RATING,
    payload: {id, props}
  };
}

export function deleteRating(id) {
  return {
    type: DELETE_RATING,
    payload: id
  };
}

export function createSubmission(props) {
  return {
    type: CREATE_SUBMISSION,
    payload: props
  };
}

export function updateSubmission(id, props) {
  return {
    type: UPDATE_SUBMISSION,
    payload: {id, props}
  };
}

export function deleteSubmission(id) {
  return {
    type: DELETE_SUBMISSION,
    payload: id
  };
}

export function createTask(props) {
  return {
    type: CREATE_TASK,
    payload: props
  };
}

export function updateTask(id, props) {
  return {
    type: UPDATE_TASK,
    payload: {id, props}
  };
}

export function deleteTask(id) {
  return {
    type: DELETE_TASK,
    payload: id
  };
}

