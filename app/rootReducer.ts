import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { createSelector } from '@reduxjs/toolkit';
import workspaceReducer from './features/workspace/workspaceSlice';
// eslint-disable-next-line import/no-cycle
import termsReducer from './model/TermSlice';
import schoolsReducer from './model/SchoolSlice';
import coursesReducer from './model/CourseSlice';
import sheetsReducer from './model/SheetSlice';
import correctorsReducer from './model/CorrectorSlice';
import locationsReducer from './model/LocationSlice';
import tasksReducer from './model/TaskSlice';
import correctionsReducer from './model/CorrectionsSlice';
import schemaReducer from './model/SchemaSlice';
import homeReducer from './model/HomeSlice';
import annotationsReducer from './model/AnnotationSlice';
import notesReducer from './model/NoteSlice';
import submissionsReducer from './model/SubmissionSlice';
import commentsReducer from './model/CommentSlice';
import ratingsReducer from './model/RatingSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    annotations: annotationsReducer,
    submissions: submissionsReducer,
    comments: commentsReducer,
    notes: notesReducer,
    terms: termsReducer,
    schools: schoolsReducer,
    courses: coursesReducer,
    sheets: sheetsReducer,
    correctors: correctorsReducer,
    locations: locationsReducer,
    tasks: tasksReducer,
    corrections: correctionsReducer,
    schema: schemaReducer,
    workspace: workspaceReducer,
    home: homeReducer,
    ratings: ratingsReducer,
  });
}

export const selectAllEntities = createSelector(
  [
    (state: any) => state.annotations.entities,
    (state: any) => state.comments.entities,
    (state: any) => state.corrections.entities,
    (state: any) => state.correctors.entities,
    (state: any) => state.courses.entities,
    (state: any) => state.locations.entities,
    (state: any) => state.notes.entities,
    (state: any) => state.ratings.entities,
    (state: any) => state.schools.entities,
    (state: any) => state.sheets.entities,
    (state: any) => state.submissions.entities,
    (state: any) => state.tasks.entities,
    (state: any) => state.terms.entities,
  ],
  (
    annotations,
    comments,
    corrections,
    correctors,
    courses,
    locations,
    notes,
    ratings,
    schools,
    sheets,
    submissions,
    tasks,
    terms
  ) => {
    return {
      ...annotations,
      ...comments,
      ...corrections,
      ...correctors,
      ...courses,
      ...locations,
      ...notes,
      ...ratings,
      ...schools,
      ...sheets,
      ...submissions,
      ...tasks,
      ...terms,
    };
  }
);
