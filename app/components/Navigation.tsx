import {
  Tabs,
  Tab,
  makeStyles,
  IconButton,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import WebIcon from '@material-ui/icons/Web';
import WidgetsIcon from '@material-ui/icons/Widgets';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import { TabPanel, TabContext } from '@material-ui/lab';
import { useDispatch, useSelector } from 'react-redux';
import SheetOverviewPage from '../containers/SheetOverviewPage';
import { selectTabIndex, setTabIndex } from '../slices/HomeSlice';
import CorrectionViewPage from '../containers/CorrectionViewPage';
import OverviewPage from '../containers/OverviewPage';
import { useModal } from '../modals/ModalProvider';
import InfoModal from '../modals/InfoModal';
import SettingsModal from '../modals/SettingsModal';

const useStyle = makeStyles({
  indicator: {
    left: '0px',
  },
});

export default function Navigation(): JSX.Element {
  const dispatch = useDispatch();
  const showModal = useModal();
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
                width: '60px',
              }}
            >
              <Tab
                icon={<HomeIcon />}
                style={{
                  minWidth: '40px',
                }}
              />
              <Tab
                icon={<WebIcon />}
                style={{
                  minWidth: '40px',
                }}
              />
              <Tab
                icon={<WidgetsIcon />}
                style={{
                  minWidth: '40px',
                }}
              />
              <Tab
                icon={<EditIcon />}
                style={{
                  minWidth: '40px',
                }}
              />
            </Tabs>
            <IconButton
              style={{
                width: '60px',
                borderRadius: '0',
              }}
              onClick={() => showModal(InfoModal)}
            >
              <InfoIcon />
            </IconButton>
            <IconButton
              style={{
                width: '60px',
                borderRadius: '0',
              }}
              onClick={() => showModal(SettingsModal)}
            >
              <SettingsIcon />
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
            // marginBottom: '4px',
          }}
        >
          <TabPanel
            value="0"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <SheetOverviewPage />
          </TabPanel>
          <TabPanel
            value="1"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <OverviewPage />
          </TabPanel>
          <TabPanel
            value="2"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <Typography>Removed</Typography>
          </TabPanel>
          <TabPanel
            value="3"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <CorrectionViewPage />
          </TabPanel>
        </Grid>
      </TabContext>
    </Grid>
  );
}
