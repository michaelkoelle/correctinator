/* eslint-disable import/no-cycle */
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import workspaceReducer from './slices/WorkspaceSlice';
import termsReducer from './slices/TermSlice';
import schoolsReducer from './slices/SchoolSlice';
import coursesReducer from './slices/CourseSlice';
import sheetsReducer from './slices/SheetSlice';
import correctorsReducer from './slices/CorrectorSlice';
import locationsReducer from './slices/LocationSlice';
import tasksReducer from './slices/TaskSlice';
import correctionsReducer from './slices/CorrectionsSlice';
import schemaReducer from './slices/SchemaSlice';
import homeReducer from './slices/HomeSlice';
import annotationsReducer from './slices/AnnotationSlice';
import notesReducer from './slices/NoteSlice';
import submissionsReducer from './slices/SubmissionSlice';
import commentsReducer from './slices/CommentSlice';
import ratingsReducer from './slices/RatingSlice';
import correctionPageReducer from './slices/CorrectionPageSlice';
import saveReducer from './slices/SaveSlice';
import overviewReducer from './slices/OverviewSlice';
import settingsReducer from './slices/SettingsSlice';
import projectsReducer from './slices/ProjectsSlice';
import launcherReducer from './slices/LauncherSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    correctionPage: correctionPageReducer,
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
    save: saveReducer,
    overview: overviewReducer,
    settings: settingsReducer,
    launcher: launcherReducer,
    projects: projectsReducer,
  });
}
