import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import workspaceReducer from './features/workspace/workspaceSlice';
// eslint-disable-next-line import/no-cycle

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    workspace: workspaceReducer,
  });
}
