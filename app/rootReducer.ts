/* eslint-disable import/no-cycle */
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import workspaceReducer from './features/workspace/workspaceSlice';
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
import correctionPageReducer from './model/CorrectionPageSlice';
import saveReducer from './model/SaveSlice';
import overviewReducer from './model/OverviewSlice';
import settingsReducer from './model/SettingsSlice';
import projectsReducer from './model/ProjectsSlice';
import launcherReducer from './model/LauncherSlice';

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
