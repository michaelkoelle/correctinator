import {
  Tabs,
  Tab,
  makeStyles,
  IconButton,
  Grid,
  Paper,
  Box,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import WebIcon from '@material-ui/icons/Web';
import WidgetsIcon from '@material-ui/icons/Widgets';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import { TabPanel, TabContext } from '@material-ui/lab';
import {
  getAllSubmissionDirectories,
  getSubmissionDir,
  getSubmissionFromAppDataDir,
  getUniqueSheets,
  isSubmissionFromSheet,
  saveSubmissions,
} from '../utils/FileAccess';
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
  const [tab, setTabValue] = useState<number>(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [sheetToCorrect, setSheetToCorrectValue] = useState<any>({});
  const [sheets, setSheets] = useState<any[]>([]);
  const [schemaSheet, setSchemaSheet] = useState<any>(undefined);
  const [index, setIndexValue] = useState<number>(0);
  const [timeStart, setTimeStart] = useState<Date>(new Date());
  const classes = useStyle();

  // todo: corrections vs submissions
  //

  function setCorrections(corrections: any[]) {
    const temp = [...submissions];
    corrections.forEach((c) => {
      temp[c.id] = c;
    });
    setSubmissions(temp);
    saveSubmissions(temp);
  }

  function setCorrection(correction) {
    const temps = [...submissions];
    temps.forEach((s, i) => {
      if (s.submission === correction.submission) {
        temps[i] = correction;
      }
    });
    setCorrections(temps);
  }

  function saveTimeElapsed() {
    const timeEnd = new Date();
    if (timeStart) {
      const diff = timeEnd.getTime() - timeStart?.getTime();
      let temp = {
        ...submissions.filter((s: any) =>
          isSubmissionFromSheet(s, sheetToCorrect)
        )[index],
      };
      if (temp) {
        if (temp.timeElapsed) {
          temp.timeElapsed += diff;
        } else {
          temp = {
            ...temp,
            timeElapsed: diff,
          };
        }
        setCorrection(temp);
      }
    }
  }

  function setTab(newValue) {
    const oldValue = tab;

    // Avoid unnessesary renders
    if (oldValue === newValue) {
      return;
    }

    if (oldValue === 3) {
      // save time
      saveTimeElapsed();
    }

    if (newValue === 3) {
      // start time
      setTimeStart(new Date());
    }

    setTabValue(newValue);
  }

  function setIndex(newIndex) {
    const oldIndex = index;

    // Avoid unnessesary renders
    if (oldIndex === newIndex) {
      return;
    }

    saveTimeElapsed();
    setIndexValue(newIndex);
    setTimeStart(new Date());
  }

  function setSheetToCorrect(val) {
    setSheetToCorrectValue(val);
    setIndex(0);
  }

  function reload() {
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
      setSheets(getUniqueSheets(subs));
    } else {
      setSheets([]);
    }
  }

  useEffect(() => reload(), []);

  return (
    <Grid container wrap="nowrap" style={{ height: '100%' }}>
      <TabContext value={tab.toString()}>
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
              value={tab}
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
          </Paper>
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
            <SheetOverviewPage
              sheets={sheets}
              reload={reload}
              setSheetToCorrect={setSheetToCorrect}
              setSchemaSheet={setSchemaSheet}
              setTab={setTab}
            />
          </TabPanel>
          <TabPanel
            value="1"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <OverviewPage submissions={submissions} />
          </TabPanel>
          <TabPanel
            value="2"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <SchemeGeneratorPage
              sheets={sheets}
              reload={reload}
              schemaSheet={schemaSheet}
              setSchemaSheet={setSchemaSheet}
              submissions={submissions}
              setSubmissions={setSubmissions}
              setTab={setTab}
              setSheetToCorrect={setSheetToCorrect}
            />
          </TabPanel>
          <TabPanel
            value="3"
            style={{ width: 'inherit', height: '100%', padding: '0px' }}
          >
            <CorrectionViewPage
              corrections={submissions.filter((s: any) =>
                isSubmissionFromSheet(s, sheetToCorrect)
              )}
              setCorrections={setCorrections}
              sheets={sheets}
              sheetToCorrect={sheetToCorrect}
              setSheetToCorrect={setSheetToCorrect}
              index={index}
              setIndex={setIndex}
              setCorrection={setCorrection}
              timeStart={timeStart}
            />
          </TabPanel>
        </Grid>
      </TabContext>
    </Grid>
  );
}
