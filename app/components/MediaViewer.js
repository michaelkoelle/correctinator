import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import mime from 'mime-types';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import styles from './MediaViewer.module.css';
import PDFViewer from './PDFViewer';
import { clamp } from '../utils/MathUtil';
import ImageViewer from './ImageViewer';

export default class MediaViewer extends React.Component {

  static zoomStep = 20/100;

  static minZoom = 20/100;

  static maxZoom = 300/100;

  constructor(props){
    super(props);

    this.state = {
      files: props.files,
      index: 0,
      scale: 1.0,
      rotation: 0
    };

    this.onZoomOut = this.onZoomOut.bind(this);
    this.onZoomIn = this.onZoomIn.bind(this);
    this.onRotateLeft = this.onRotateLeft.bind(this);
    this.onRotateRight = this.onRotateRight.bind(this);
    this.onNextFile = this.onNextFile.bind(this);
    this.onPreviousFile = this.onPreviousFile.bind(this);
  }

  onZoomOut(){
    const { scale } = this.state;
    this.setState({scale: clamp(scale - MediaViewer.zoomStep, MediaViewer.minZoom, MediaViewer.maxZoom)});
  }

  onZoomIn(){
    const { scale } = this.state;
    this.setState({scale: clamp(scale + MediaViewer.zoomStep, MediaViewer.minZoom, MediaViewer.maxZoom)});
  }

  onRotateLeft(){
    const { rotation } = this.state;
    this.setState({rotation: (rotation + (360 - 90)) % 360});
  }

  onRotateRight(){
    const { rotation } = this.state;
    this.setState({rotation: (rotation + 90) % 360});
  }

  onNextFile(){
    const { index, files } = this.state;
    this.resetScaleAndRotation();
    this.setState({index: Math.abs((index + 1) % files.length)})
  }

  onPreviousFile(){
    const { index, files } = this.state;
    this.resetScaleAndRotation();
    this.setState({index: Math.abs((index + (files.length - 1)) % files.length)})
  }

  resetScaleAndRotation(){
    this.setState({rotation: 0, scale: 1.0});
  }

  render() {
    const { files, index, scale, rotation } = this.state;
    const type = mime.lookup(files[index]);
    let viewer = [];
    switch (type) {
      case "application/pdf": viewer = <PDFViewer path={files[index]} scale={scale} rotation={rotation}/>; break;
      case "image/jpeg": viewer = <ImageViewer path={files[index]} scale={scale} rotation={rotation}/>; break;
      default: console.error("DEFAULT");
    }
    console.log(type);

    return (
      <div className={styles.Container}>
        <AppBar position="fixed" className={styles.AppBar}>
          <Toolbar variant="dense">
            <Button color="inherit" onClick={this.onZoomOut} disabled={scale===MediaViewer.minZoom}><Icon className="fas fa-search-minus" /></Button>
            <Button color="inherit" onClick={this.onZoomIn} disabled={scale===MediaViewer.maxZoom}><Icon className="fas fa-search-plus"/></Button>
            <Button color="inherit" onClick={this.onPreviousFile}><Icon className="fas fa-backward"/></Button>
            <Typography variant="h6">{index+1} / {files.length}</Typography>
            <Button color="inherit" onClick={this.onNextFile}><Icon className="fas fa-forward"/></Button>
            <Button color="inherit" onClick={this.onRotateLeft}><Icon className="fas fa-reply"/></Button>
            <Button color="inherit" onClick={this.onRotateRight}><Icon className="fas fa-share"/></Button>
          </Toolbar>
        </AppBar>
        <div className={styles.Content}>
          {viewer}
        </div>

      </div>
    );
  }
}

MediaViewer.propTypes = {
  files: PropTypes.arrayOf(PropTypes.string).isRequired
};
