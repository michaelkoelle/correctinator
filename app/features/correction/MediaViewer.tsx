/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable import/no-cycle */
import {
  Backdrop,
  Button,
  Container,
  Fab,
  Grid,
  Icon,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import ErrorIcon from '@material-ui/icons/Error';
import BorderClearIcon from '@material-ui/icons/BorderClear';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React, { useState } from 'react';
import { shell } from 'electron';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import mime from 'mime-types';
import PDFViewer from './PDFViewer';
import clamp from '../../utils/MathUtil';
import ImageViewer from './ImageViewer';
import TextViewer from './TextViewer';

export default function MediaViewer(props: any) {
  const [fileIndex, setFileIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { files = [] } = props;

  const ZOOMSTEP = 20 / 100;
  const ZOOMMIN = 40 / 100;
  const ZOOMMAX = 500 / 100;

  function resetScaleAndRotation() {
    setRotation(0);
    setScale(1);
  }

  function onResetScale() {
    setScale(1);
  }

  function onOpenFolder() {
    shell.showItemInFolder(files[fileIndex]);
  }

  function onOpenInNew() {
    // TODO:
  }

  function onZoomIn() {
    setScale(clamp(scale + ZOOMSTEP, ZOOMMIN, ZOOMMAX));
  }

  function onZoomOut() {
    setScale(clamp(scale - ZOOMSTEP, ZOOMMIN, ZOOMMAX));
  }

  function onRotateLeft() {
    setRotation((rotation - 90) % 360);
  }

  function onRotateRight() {
    setRotation((rotation + 90) % 360);
  }

  function onNextFile() {
    resetScaleAndRotation();
    setFileIndex(Math.abs((fileIndex + 1) % files.length));
  }

  function onPreviousFile() {
    resetScaleAndRotation();
    setFileIndex(Math.abs((fileIndex + (files.length - 1)) % files.length));
  }

  const type = mime.lookup(files[fileIndex]);
  let viewer;

  switch (true) {
    case type === 'application/pdf':
      viewer = (
        <PDFViewer file={files[fileIndex]} scale={scale} rotation={rotation} />
      );
      break;
    case /image\/.+/.test(type):
      viewer = (
        <ImageViewer
          file={files[fileIndex]}
          scale={scale}
          rotation={rotation}
        />
      );
      break;
    default:
      viewer = (
        <TextViewer file={files[fileIndex]} scale={scale} rotation={rotation} />
      );
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          margin: '0 0 0 10px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {viewer}
      </div>
      <Grid
        container
        style={{ position: 'absolute', bottom: '20px' }}
        justify="center"
        alignItems="center"
      >
        <Paper>
          <Grid item container justify="center" alignItems="center">
            <Grid item>
              <Tooltip title="Previous file">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onPreviousFile}
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Rotate left">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onRotateLeft}
                >
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Zoom in">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onZoomIn}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                ({fileIndex + 1}/{files.length})
              </Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Zoom out">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onZoomOut}
                >
                  <RemoveIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Rotate right">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onRotateRight}
                >
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Next file">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onNextFile}
                >
                  <NavigateNextIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Reset scale">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onResetScale}
                >
                  <BorderClearIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Open file in folder">
                <IconButton
                  color="primary"
                  size="medium"
                  aria-label="add"
                  onClick={onOpenFolder}
                >
                  <FolderOpenIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Open in new window">
                <span>
                  <IconButton
                    disabled
                    color="primary"
                    size="medium"
                    aria-label="add"
                    onClick={onOpenInNew}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </div>
  );
}
