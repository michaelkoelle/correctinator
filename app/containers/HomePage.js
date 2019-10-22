// @flow
import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { openSubmissions } from '../actions/actionCreators';
import { store } from '../index';


type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <Button variant="contained" onClick={() => store.dispatch(openSubmissions())}>
          Open Submissions
        </Button>
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
