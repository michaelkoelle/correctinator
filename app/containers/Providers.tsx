/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import Routes from '../Routes';
import ModalProvider from '../modals/ModalProvider';
import createTheme from '../theme';
import { selectSettingsTheme } from '../model/SettingsSlice';
import { Theme } from '../model/Theme';
import SystemThemeUpdateEffect from '../effects/SystemThemeUpdateEffect';

type Props = {
  history: History;
};

const Providers = ({ history }: Props) => {
  const theme: Theme = useSelector(selectSettingsTheme);
  const [, setCurrentTheme] = useState(createTheme(theme));

  useEffect(SystemThemeUpdateEffect(setCurrentTheme, theme), [
    setCurrentTheme,
    theme,
  ]);

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <CssBaseline />
      <ModalProvider>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </ModalProvider>
    </ThemeProvider>
  );
};

export default Providers;
