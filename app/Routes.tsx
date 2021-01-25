/* eslint react/jsx-props-no-spreading: off */
import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { remote } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import routes from './constants/routes.json';
import App from './containers/App';
import SchemeGeneratorPage from './containers/SchemeGeneratorPage';
import OverviewPage from './containers/OverviewPage';
import CorrectionViewPage from './containers/CorrectionViewPage';
import SheetOverviewPage from './containers/SheetOverviewPage';
import NewHomePage from './containers/NewHomePage';
import FramelessTitleBar from './containers/FramelessTitleBar';
import { reloadState } from './utils/FileAccess';
import { selectWorkspacePath } from './features/workspace/workspaceSlice';

// Lazily load routes and code split with webpack
/* const LazyCounterPage = React.lazy(() => import('./containers/CounterPage'));

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);
*/
export default function Routes() {
  const dispatch = useDispatch();
  const workspace = useSelector(selectWorkspacePath);

  useEffect(() => {
    reloadState(dispatch, workspace);
  }, [dispatch, workspace]);

  const [shouldUseDarkColors, setShouldUseDarkColors] = useState(
    remote.nativeTheme.shouldUseDarkColors
  );

  remote.nativeTheme.on('updated', () =>
    setShouldUseDarkColors(remote.nativeTheme.shouldUseDarkColors)
  );

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: shouldUseDarkColors ? 'dark' : 'light',
        },
        overrides: {
          MuiTableCell: {
            root: {
              userSelect: 'none',
            },
          },
          MuiCssBaseline: {
            '@global': {
              '*::-webkit-scrollbar': {
                width: '0.5em',
              },
              '*::-webkit-scrollbar-track': {
                '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
              },
              '*::-webkit-scrollbar-thumb': {
                backgroundColor: shouldUseDarkColors
                  ? 'rgba(255,255,255,.2)'
                  : 'rgba(0,0,0,.2)',
                outline: '1px solid slategrey',
                borderRadius: '5px',
              },
            },
          },
        },
      }),
    [shouldUseDarkColors]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App>
        <FramelessTitleBar theme={theme} />
        <Switch>
          <Route path={routes.SHEETOVERVIEW} component={SheetOverviewPage} />
          <Route path={routes.CORRECTIONVIEW} component={CorrectionViewPage} />
          <Route path={routes.OVERVIEW} component={OverviewPage} />
          <Route
            path={routes.SCHEMAGENERATOR}
            component={SchemeGeneratorPage}
          />
          <Route path={routes.HOME} component={NewHomePage} />
        </Switch>
      </App>
    </ThemeProvider>
  );
}
