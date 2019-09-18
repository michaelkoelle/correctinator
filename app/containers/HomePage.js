// @flow
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import FileViewer from 'react-file-viewer';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import SubmissionsTable from '../components/SubmissionsTable';
import Overview from '../components/Overview';
import {openSubmissions} from '../utils/FileAccess'
import Task from '../components/Task';

type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <Button variant="contained" onClick={openSubmissions}>
          Open Submissions
        </Button>
        <SubmissionsTable/>
        <Overview/>
        <Task/>
      </div>
    );
  }


  /*
  render() {
    return (
      <div>
        <SplitPane split="vertical" minSize={50} defaultSize="50%">
          <div>
            <SubmissionsTable/>
            <Overview/>
          </div>
          <Paper>
            <Button variant="contained" onClick={openSubmissions}>
              Default
            </Button>
            <FileViewer
              fileType='pdf'
              filePath='samples/sample.pdf'
            />
          </Paper>
        </SplitPane>
      </div>
    );
  }

*/
}
