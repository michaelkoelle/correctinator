import {
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import LaunchIcon from '@material-ui/icons/Launch';
import RemoveIcon from '@material-ui/icons/Remove';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import CropFreeIcon from '@material-ui/icons/CropFree';
import React, { useEffect } from 'react';
import { shell } from 'electron';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import * as Path from 'path';
import { useSelector } from 'react-redux';
import clamp from '../../utils/MathUtil';
import {
  MediaViewerSettings,
  selectSettingsMediaViewer,
} from '../../model/SettingsSlice';

type ViewerToolbarProps = {
  filePaths: string[];
  fileIndex: number;
  setFileIndex: (v: number) => void;
  scale: number;
  setScale: (v: number) => void;
  rotation: number;
  setRotation: (v: number) => void;
};

const ZOOMSTEP = 20 / 100;
const ZOOMMIN = 40 / 100;
const ZOOMMAX = 500 / 100;

export default function ViewerToolbar(props: ViewerToolbarProps) {
  const {
    filePaths,
    fileIndex,
    setFileIndex,
    scale,
    setScale,
    rotation,
    setRotation,
  } = props;
  const settings: MediaViewerSettings = useSelector(selectSettingsMediaViewer);

  function resetScaleAndRotation() {
    setRotation(0);
    setScale(1);
  }

  function onResetScale() {
    setScale(1);
  }

  function onOpenFolder() {
    shell.showItemInFolder(filePaths[fileIndex]);
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
    if (
      settings.cycleFiles ||
      (!settings.cycleFiles && fileIndex + 1 < filePaths.length)
    )
      setFileIndex(Math.abs((fileIndex + 1) % filePaths.length));
  }

  function onPreviousFile() {
    resetScaleAndRotation();

    if (settings.cycleFiles || (!settings.cycleFiles && fileIndex - 1 >= 0)) {
      setFileIndex(
        Math.abs((fileIndex + (filePaths.length - 1)) % filePaths.length)
      );
    }
  }

  useEffect(() => {
    function handleScrollEvent(event: WheelEvent) {
      if (event.ctrlKey) {
        if (event.deltaY > 0) {
          onZoomOut();
        } else {
          onZoomIn();
        }
      }
    }

    window.addEventListener('wheel', handleScrollEvent);
    return () => {
      window.removeEventListener('wheel', handleScrollEvent);
    };
  }, []);

  return (
    <Grid
      container
      style={{ position: 'absolute', bottom: '20px' }}
      justify="center"
      alignItems="center"
    >
      <Paper>
        <Grid
          item
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={0}
        >
          <Grid item container justify="center" alignItems="center">
            <Grid item>
              <Tooltip title="Previous file">
                <IconButton
                  size="medium"
                  aria-label="add"
                  onClick={onPreviousFile}
                  disabled={
                    filePaths.length === 1 ||
                    (!settings.cycleFiles && fileIndex - 1 < 0)
                  }
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Rotate left">
                <IconButton
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
                <span>
                  <IconButton
                    size="medium"
                    aria-label="add"
                    onClick={onZoomIn}
                    disabled={scale >= ZOOMMAX}
                  >
                    <AddIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                {`(${fileIndex + 1}/${filePaths.length})`}
              </Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Zoom out">
                <span>
                  <IconButton
                    size="medium"
                    aria-label="add"
                    onClick={onZoomOut}
                    disabled={scale <= ZOOMMIN}
                  >
                    <RemoveIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Rotate right">
                <IconButton
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
                  size="medium"
                  aria-label="add"
                  onClick={onNextFile}
                  disabled={
                    filePaths.length === 1 ||
                    (!settings.cycleFiles && fileIndex + 1 >= filePaths.length)
                  }
                >
                  <NavigateNextIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Reset scale">
                <IconButton
                  size="medium"
                  aria-label="add"
                  onClick={onResetScale}
                  disabled={scale === 1}
                >
                  <CropFreeIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            {!settings.showFileName && (
              <Grid item>
                <Tooltip title="Reveal file in folder">
                  <IconButton
                    size="medium"
                    aria-label="add"
                    onClick={onOpenFolder}
                  >
                    <LaunchIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Grid>
          {settings.showFileName && (
            <Grid
              item
              container
              justify="center"
              alignItems="center"
              style={{ marginTop: '-5px', marginBottom: '2px' }}
            >
              <Typography variant="caption">
                {Path.basename(filePaths[fileIndex])}
              </Typography>
              <Tooltip title="Reveal file in folder">
                <IconButton
                  size="small"
                  style={{ marginLeft: '5px' }}
                  onClick={onOpenFolder}
                >
                  <LaunchIcon style={{ width: '12px', height: '12px' }} />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Grid>
  );
}
