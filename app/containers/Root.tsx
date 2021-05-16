import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { CssBaseline, ThemeProvider, useTheme } from '@material-ui/core';
import { remote } from 'electron';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import Routes from '../Routes';
import ModalProvider from '../modals/ModalProvider';
import createTheme from '../theme';

type Props = {
  store: EnhancedStore<any, AnyAction, any[]>;
  history: History;
};

const Root = ({ store, history }: Props) => {
  const theme = useTheme();
  const [, setCurrentTheme] = useState(createTheme(theme));

  useEffect(() => {
    const setTheme = () => {
      // Does nothing but required for force reload
      setCurrentTheme(createTheme(theme));
    };
    remote.nativeTheme.on('updated', setTheme);
    return () => {
      remote.nativeTheme.removeListener('updated', setTheme);
    };
  }, [theme]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <ModalProvider>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </ModalProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default hot(Root);
