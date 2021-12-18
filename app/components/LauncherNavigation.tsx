import {
  Tabs,
  Tab,
  makeStyles,
  IconButton,
  Grid,
  Paper,
  useTheme,
  Menu,
  MenuItem,
} from '@material-ui/core';
import React, { useState } from 'react';
import SettingsIcon from '@material-ui/icons/Settings';
import { TabPanel, TabContext } from '@material-ui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../modals/ModalProvider';
import SettingsModal from '../modals/SettingsModal';
import { version } from '../package.json';
import {
  launcherSetTabIndex,
  selectLauncherState,
} from '../model/LauncherSlice';
import LauncherTabs from '../model/LauncherTabs';
import LauncherProjectsPage from './LauncherProjectsPage';
import LauncherSheetsPage from './LauncherSheetsPage';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import UpdaterModal from '../modals/UpdaterModal';

const useStyle = makeStyles({
  indicator: {
    left: '0px',
    width: '100%',
    // zIndex: 0,
    opacity: 0.5,
  },
  wrapper: {
    // flexDirection: 'row',
    zIndex: 100,
    alignItems: 'flex-start',
    marginLeft: '5px',
    textTransform: 'none',
  },
});

export default function LauncherNavigation(): JSX.Element {
  const dispatch = useDispatch();
  const showModal = useModal();
  const theme = useTheme();
  const { tabIndex } = useSelector(selectLauncherState);
  const selectedFile = useSelector(selectWorkspacePath);
  const classes = useStyle();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const onCheckForUpdates = () => {
    setAnchorEl(null);
    showModal(UpdaterModal, { showNotAvailiable: true });
  };

  const onSettings = () => {
    setAnchorEl(null);
    showModal(SettingsModal);
  };

  return (
    <Grid container wrap="nowrap" style={{ height: '100%' }}>
      <TabContext value={tabIndex.toString()}>
        <Grid item>
          <Paper
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100% - 29px)',
              boxShadow: '1px 2px 5px 0px rgba(0,0,0,0.2)',
              width: 'fit-content',
              position: 'relative',
              // zIndex: 9998,
              zIndex: 198,
            }}
            square
          >
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
              wrap="nowrap"
              style={{
                width: '200px',
                marginTop: '0px',
                marginBottom: '20px',
              }}
            >
              <Grid
                item
                style={{
                  width: '35px',
                  margin: '15px',
                  marginBottom: '10px',
                  padding: 0,
                }}
              >
                <img
                  style={{ width: '35px' }}
                  src="../resources/icon.ico"
                  alt="correctinator"
                />
              </Grid>
              <Grid container item direction="column">
                <Grid item>correctinator</Grid>
                <Grid item>{`v${version}`}</Grid>
              </Grid>
            </Grid>
            <Tabs
              orientation="vertical"
              variant="standard"
              indicatorColor="primary"
              value={tabIndex}
              onChange={(_e, v) => dispatch(launcherSetTabIndex(v))}
              classes={{
                indicator: classes.indicator,
              }}
              style={{
                flex: '1 1 0%',
              }}
            >
              <Tab
                label="Projects"
                classes={{
                  wrapper: classes.wrapper,
                }}
              />
              {selectedFile && (
                <Tab
                  label="Sheets"
                  classes={{
                    wrapper: classes.wrapper,
                  }}
                />
              )}
            </Tabs>
            <IconButton
              style={{
                width: '30px',
                borderRadius: '0',
                margin: '5px',
              }}
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <SettingsIcon style={{ fill: theme.palette.text.disabled }} />
            </IconButton>
          </Paper>
        </Grid>
        <Grid
          item
          container
          justify="center"
          alignItems="flex-start"
          style={{
            marginLeft: '16px',
            marginRight: '4px',
          }}
        >
          <TabPanel
            value={LauncherTabs.PROJECTS.toString()}
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <LauncherProjectsPage />
          </TabPanel>
          <TabPanel
            value={LauncherTabs.SHEETS.toString()}
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <LauncherSheetsPage />
          </TabPanel>
        </Grid>
      </TabContext>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => onCheckForUpdates()}>
          Check for Updates
        </MenuItem>
        <MenuItem onClick={() => onSettings()}>Settings</MenuItem>
      </Menu>
    </Grid>
  );
}
