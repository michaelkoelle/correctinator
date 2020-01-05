// @flow
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import FileViewer from 'react-file-viewer';
import Button from '@material-ui/core/Button';
import { CardMedia, Container, Typography } from '@material-ui/core';
import SubmissionsTable from '../components/SubmissionsTable';
import Overview from '../components/Overview';
import Task from '../components/Task';
import { openSubmissions } from '../actions/actionCreators';
import { store } from '../index';
import MediaViewer from '../components/MediaViewer';


type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div style={{background: 'red'}}>
        <MediaViewer files={["C:\\Users\\Michi\\Downloads\\abgaben_Blatt09_Rechnerarchitektur\\215652\\Uebungsblatt 09 - Abgabe.pdf",
          "C:\\Users\\Michi\\Downloads\\abgaben_Blatt09_Rechnerarchitektur\\215697\\9. Ab H.pdf",
          "C:\\Users\\Michi\\Downloads\\abgaben_Blatt09_Rechnerarchitektur\\215708\\BLATT9\\BLATT9.pd",
          "C:\\Users\\Michi\\Downloads\\nasamoonrock.jpg",
          "D:\\Programming\\correctinator\\app\\samples\\image.jpeg",
          "D:\\Programming\\correctinator\\app\\samples\\server.txt",
          "D:\\Programming\\correctinator\\app\\samples\\server.java"
        ]}/>
      </div>
    );
  }


  /*

  render() {
    return (
      <div>
        <Button variant="contained" onClick={() => store.dispatch(openSubmissions())}>
          Open Submissions
        </Button>
        <SubmissionsTable/>
        <Overview/>
        <Task/>
        <Typography>TEst</Typography>
        <FileViewer
          fileType={"pdf"}
          filePath={"C:\\Users\\Michi\\Downloads\\abgaben_Blatt09_Rechnerarchitektur\\215329\\Abgabe.pdf"}
        />
      </div>
    );
  }


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
