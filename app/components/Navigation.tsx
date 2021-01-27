import {
  Tabs,
  Tab,
  makeStyles,
  IconButton,
  Grid,
  Paper,
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
import SchemeGeneratorPage from '../containers/SchemeGeneratorPage';
import { selectTabIndex, setTabIndex } from '../model/HomeSlice';

const useStyle = makeStyles({
  indicator: {
    left: '0px',
  },
});

export default function Navigation(): JSX.Element {
  const dispatch = useDispatch();
  // const workspacePath = useSelector((state: any) => state.workspace.path);
  const tabIndex = useSelector(selectTabIndex);
  // const [tab, setTabValue] = useState<number>(0);
  // const [submissions, setSubmissions] = useState<any[]>([]);
  // const [sheetToCorrect, setSheetToCorrectValue] = useState<any>({});
  // const [sheets, setSheets] = useState<any[]>([]);
  // const [schemaSheet, setSchemaSheet] = useState<any>(undefined);
  // const [index, setIndexValue] = useState<number>(0);
  // const [timeStart, setTimeStart] = useState<Date>(new Date());
  const classes = useStyle();

  /*
  const tasksForCorr1 = (state) =>
    state.corrections.entities
      .find((c) => c.submission === 'uwa3fcjatpirlrnk')
      .tasks.map((i) => state.tasks.entities[i]);

  const selectC = useSelector((state) =>
    selectCorrectionById(state, 'uwa3fcjatpirlrnk')
  );

  const tasdsd = createSelector(selectCorrectionById('uwa3fcjatpirlrnk'), (c) =>
    c.tasks.map((i) => state.tasks.entities[i])
  );
  const tasksOf = useSelector(tasksForCorr1);
  console.log(tasksOf);
*/
  // todo: corrections vs submissions

  /*
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
*/
  function setTab(newValue) {
    dispatch(setTabIndex(newValue));
    /*
    const oldValue = tab;

    // Avoid unnessesary renders
    if (oldValue === newValue) {
      return;
    }

    if (oldValue === 3) {
      // save time
      // saveTimeElapsed();
    }

    if (newValue === 3) {
      // start time
      // setTimeStart(new Date());
    }

    setTabValue(newValue);
    */
  }

  /*
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
    const path = workspacePath;
    const subs: any[] = [];
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    const corrections: Correction[] = [];
    submissionDirectories.forEach((dir, i) => {
      const temp = getSubmissionFromAppDataDir(dir, path);
      corrections.push(Uni2WorkParser.deserialize(temp));
      // dispatch(correctionsAddOne(test));
      // temp.id = i;
      subs.push(temp);
    });
    setSubmissions(subs);

    console.log('////////////////////////');
    const normal = normalize(corrections, CorrectionsSchema);
    console.log(normal);
    dispatch(correctionsImport(normal.entities));
    console.log('////////////////////////');

    if (subs.length > 0) {
      setSheets(getUniqueSheets(subs));
    } else {
      setSheets([]);
    }
  }

  useEffect(() => reload(), []);
  useEffect(() => reload(), [workspacePath]);

  */
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
          style={{
            marginLeft: '16px',
            marginRight: '4px',
            marginBottom: '4px',
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
            {/*
            <OverviewPage submissions={submissions} />
          */}
            2
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
            {/*
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
              /> */}
            4
          </TabPanel>
        </Grid>
      </TabContext>
    </Grid>
  );
}
