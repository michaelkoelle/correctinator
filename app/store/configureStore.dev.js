import { createStore, applyMiddleware, compose } from 'redux';
import {persistReducer } from 'redux-persist'
import createElectronStorage from "redux-persist-electron-storage";
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import ElectronStore from 'electron-store';
import createRootReducer from '../reducers';
import * as testactions from '../actions/actionCreators';

const history = createHashHistory();

const electronStore = new ElectronStore();
const persistConfig = {
  key: 'root',
  storage: createElectronStorage({
    electronStore
  })
};

const rootReducer = createRootReducer(history);

const configureStore = () => {
  console.log("CONFIGURE STORE");
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...testactions,
    ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
        actionCreators
      })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  // Create Store
  const store = createStore(persistedReducer, {}, enhancer);

  if (module.hot) {
    module.hot.accept(
      '../reducers',
      // eslint-disable-next-line global-require
      () => store.replaceReducer(persistReducer(persistConfig, require('../reducers').default))
    );
  }

  return store;
};
export default { configureStore, history};
