import {
  Tabs,
  Tab,
  makeStyles,
  IconButton,
  Grid,
  Paper,
  useTheme,
} from '@material-ui/core';
import React from 'react';
import SettingsIcon from '@material-ui/icons/Settings';
import { TabPanel, TabContext } from '@material-ui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { selectTabIndex, setTabIndex } from '../model/HomeSlice';
import { useModal } from '../modals/ModalProvider';
import SettingsModal from '../modals/SettingsModal';
import { version } from '../package.json';
import LauncherProjectsPage from './LauncherProjectsPage';

const useStyle = makeStyles({
  indicator: {
    left: '0px',
    width: '100%',
    zIndex: 0,
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
  const tabIndex = useSelector(selectTabIndex);
  const classes = useStyle();

  function setTab(newValue) {
    dispatch(setTabIndex(newValue));
  }

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
              zIndex: 9998,
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
              onChange={(_e, v) => setTab(v)}
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
            </Tabs>
            <IconButton
              style={{
                width: '30px',
                borderRadius: '0',
                margin: '5px',
              }}
              size="small"
              onClick={() => showModal(SettingsModal)}
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
            value="0"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <LauncherProjectsPage />
          </TabPanel>
        </Grid>
      </TabContext>
    </Grid>
  );
}
