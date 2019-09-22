// @flow
import fs from "fs";
import path from "path";
import type { GetState, Dispatch } from '../reducers/types';
import {
  SET_LAST_OPEN,
  SET_SUBMISSIONS,
  ADD_SUBMISSION,
  SET_CURRENT_SUBMISSION,
  SET_CURRENT_ROW,
  NEXT_SUBMISSION,
  PREV_SUBMISSION,
  OPEN_SUBMISSIONS,
  LOAD_SUBMISSIONS
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
      submissions.push(parse(fs.readFileSync(ratingFile, 'utf8'), directory, ratingFile, files));
    });

    if(submissions.length > 0){
      dispatch(setSubmissions(submissions)); // TODO normalize
    }
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


