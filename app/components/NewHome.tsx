import { Tabs, Tab, makeStyles, IconButton, Grid } from '@material-ui/core';
import React, { useEffect } from 'react';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import WebIcon from '@material-ui/icons/Web';
import WidgetsIcon from '@material-ui/icons/Widgets';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import { TabPanel, TabContext } from '@material-ui/lab';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import {
  getAllSubmissionDirectories,
  getSubmissionDir,
  getSubmissionFromAppDataDir,
} from '../utils/FileAccess';
import styles from './Home.css';
import Overview from '../features/overview/Overview';
import SheetOverview from '../features/sheet-overview/SheetOverview';
import SheetOverviewPage from '../containers/SheetOverviewPage';
import OverviewPage from '../containers/OverviewPage';
import SchemeGeneratorPage from '../containers/SchemeGeneratorPage';
import CorrectionViewPage from '../containers/CorrectionViewPage';

const useStyle = makeStyles({
  indicator: {
    left: '0px',
  },
});

export default function Home(): JSX.Element {
  const [value, setValue] = React.useState(0);
  const [submissions, setSubmissions] = React.useState([]) as any;
  const [selected, setSelected] = React.useState({}) as any;
  const classes = useStyle();

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    newValue: number
  ) => {
    setValue(newValue);
  };

  function loadSubmissions() {
    const path = getSubmissionDir();
    const subs: any[] = [];
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    submissionDirectories.forEach((dir, i) => {
      const temp = getSubmissionFromAppDataDir(dir);
      temp.id = i;
      subs.push(temp);
    });
    setSubmissions(subs);
    if (subs.length > 0) {
      setSelected(subs[0]);
    }
  }

  useEffect(() => loadSubmissions(), []);

  return (
    <Grid container wrap="nowrap" style={{ height: '100%' }}>
      <TabContext value={value.toString()}>
        <Grid item>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100% - 29px)',
              boxShadow: '3px 0px 5px 0px rgba(0,0,0,0.2)',
              width: 'fit-content',
            }}
          >
            <Tabs
              orientation="vertical"
              variant="standard"
              value={value}
              onChange={handleChange}
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
              disabled
            >
              <InfoIcon />
            </IconButton>
            <IconButton
              style={{
                width: '60px',
                borderRadius: '0',
              }}
              disabled
            >
              <SettingsIcon />
            </IconButton>
          </div>
        </Grid>
        <Grid
          item
          container
          justify="center"
          alignItems="flex-start"
          style={{ marginLeft: '16px' }}
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
            <SchemeGeneratorPage />
          </TabPanel>
          <TabPanel
            value="3"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <CorrectionViewPage submissions={submissions} />
          </TabPanel>
        </Grid>
      </TabContext>
    </Grid>
  );
}
