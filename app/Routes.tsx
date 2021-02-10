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
import { saveAllCorrections } from './utils/FileAccess';
import { selectUnsavedChanges } from './model/SaveSlice';
import UpdaterDialog from './components/UpdaterDialog';

export default function Routes() {
  const dispatch = useDispatch();
  // const workspace = useSelector(selectWorkspacePath);
  const unsavedChanges = useSelector(selectUnsavedChanges);
  const [openUpdaterDialog, setOpenUpdaterDialog] = useState<boolean>(false);
  const [showNotAvailiable, setShowNotAvailiable] = useState<boolean>(false);

  function updaterDialog(show: boolean) {
    setShowNotAvailiable(show);
    setOpenUpdaterDialog(true);
  }

  useEffect(() => {
    updaterDialog(false);
  }, []);

  useEffect(() => {
    const beforeQuit = (e) => {
      if (unsavedChanges) {
        // e.returnValue = false;
        dispatch(saveAllCorrections());
      }
    };
    window.addEventListener('beforeunload', beforeQuit, true);
    return () => {
      window.removeEventListener('beforeunload', beforeQuit, true);
    };
  }, [dispatch, unsavedChanges]);

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
        <FramelessTitleBar setOpenUpdater={updaterDialog} />
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
        <UpdaterDialog
          open={openUpdaterDialog}
          setOpen={setOpenUpdaterDialog}
          showNotAvailiable={showNotAvailiable}
        />
      </App>
    </ThemeProvider>
  );
}
