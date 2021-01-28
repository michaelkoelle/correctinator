import {
  configureStore,
  getDefaultMiddleware,
  Action,
  MiddlewareAPI,
} from '@reduxjs/toolkit';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { ThunkAction } from 'redux-thunk';
// eslint-disable-next-line import/no-cycle
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createRootReducer from './rootReducer';
import { reportChange } from './model/SaveSlice';
import { saveAllCorrections } from './utils/FileAccess';

const persistConfig = {
  key: 'root',
  whitelist: ['workspace'],
  storage,
};

export const history = createHashHistory();
const combinedReducer = createRootReducer(history);
const rootReducer: any = persistReducer(persistConfig, combinedReducer);
export type RootState = ReturnType<typeof rootReducer>;

const router = routerMiddleware(history);
const defMiddleware = (mid) =>
  mid({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  });

const middleware = [...defMiddleware(getDefaultMiddleware), router];

const changeMiddleware = (store: MiddlewareAPI) => (next) => (action) => {
  if (action.type !== 'save/reportChange') {
    if (!store.getState().save.unsavedChanges) {
      store.dispatch(reportChange());
    }
  }

  return next(action);
};

middleware.push(changeMiddleware);

const excludeLoggerEnvs = ['test', 'production'];
const shouldIncludeLogger = !excludeLoggerEnvs.includes(
  process.env.NODE_ENV || ''
);

if (shouldIncludeLogger) {
  const logger = createLogger({
    level: 'info',
    collapsed: true,
  });
  middleware.push(logger);
}

export const configuredStore = (initialState?: RootState) => {
  // Create Store
  const store = configureStore({
    reducer: rootReducer,
    middleware,
    preloadedState: initialState,
  });

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./rootReducer', () =>
      store.replaceReducer(
        // eslint-disable-next-line global-require
        persistReducer(persistConfig, require('./rootReducer').default)
      )
    );
  }
  const persistor = persistStore(store);
  return { store, persistor };
};
export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
