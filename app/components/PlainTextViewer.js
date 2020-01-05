import React from 'react';
import PropTypes from 'prop-types';
import fs from 'fs';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import styles from "./PlainTextViewer.module.css";
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop/Backdrop';

export default class PlainTextViewer extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      data: fs.readFileSync(props.path, 'utf-8')
    };
  }

  render() {
    const { path, scale, rotation } = this.props;
    const { data } = this.state;
    const width = window.innerWidth * 0.95;
    const height = window.innerHeight * 0.90;

    return (
      <AceEditor
        value={data}
        mode="java"
        theme="github"
        onChange={code => console.log(code)}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        width={width}
        readOnly
        minLines={69}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
        }}
        className={styles.Editor}
      />
    );
  }
}

PlainTextViewer.propTypes = {
  path: PropTypes.string.isRequired,
  scale: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired
};
