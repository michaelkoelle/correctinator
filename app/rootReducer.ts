import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
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

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
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
  });
}
