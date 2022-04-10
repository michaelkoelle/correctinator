/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import ModalProvider from '../modals/ModalProvider';
import createTheme from '../theme';
import { selectSettingsGeneral } from '../slices/SettingsSlice';
import SystemThemeUpdateEffect from '../effects/SystemThemeUpdateEffect';
import ViewManager from '../components/ViewManager';

type Props = {
  history: History;
  location: any;
};

const Providers = ({ history, location }: Props) => {
  const { theme } = useSelector(selectSettingsGeneral);
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
          <ViewManager
            name={location.search.substr(1)} /* location={location} */
          />
        </ConnectedRouter>
      </ModalProvider>
    </ThemeProvider>
  );
};

export default Providers;
