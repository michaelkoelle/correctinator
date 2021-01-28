import React, { Fragment } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './app.global.css';

const { store, persistor } = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default;
  render(
    <PersistGate loading={null} persistor={persistor}>
      <AppContainer>
        <Root store={store} history={history} />
      </AppContainer>
    </PersistGate>,
    document.getElementById('root')
  );
});
