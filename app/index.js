import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { persistStore } from "redux-persist";
// eslint-disable-next-line import/no-cycle
import Root from './containers/Root';
// eslint-disable-next-line import/no-cycle
import { configureStore, history } from './store/configureStore';
import './app.global.css';

export const store = configureStore();
export const persistor = persistStore(store);

persistor.purge();

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
