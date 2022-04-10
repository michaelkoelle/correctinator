import { Box, Grid, Typography } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import React, { useEffect, useState } from 'react';
import * as Path from 'path';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import mime from 'mime-types';
import fs from 'fs';
import { useDispatch, useSelector } from 'react-redux';
import PDFViewer from './PDFViewer';
import ImageViewer from './ImageViewer';
import TextViewer from './TextViewer';
import { loadFilesFromWorkspace } from '../../utils/FileAccess';
import { selectWorkspacePath } from '../../slices/WorkspaceSlice';
import { submissionsUpdateOne } from '../../slices/SubmissionSlice';
import File from '../../model/File';
import ViewerToolbar from './ViewerToolbar';

type MediaViewerContainerProps = {
  submissionId: string;
  submissionName: string;
  submissionFiles: File[];
};

export default function MediaViewer(props: MediaViewerContainerProps) {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<string[]>([]);
  const [fileIndex, setFileIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const workspace = useSelector(selectWorkspacePath);
  const { submissionId, submissionName, submissionFiles } = props;

  useEffect(() => {
    if (submissionName) {
      setFiles(loadFilesFromWorkspace(submissionName, workspace));
    } else {
      setFiles([]);
    }
    setRotation(0);
    setScale(1);
    setFileIndex(0);
  }, [submissionName, workspace]);

  useEffect(() => {
    if (
      files.length > 0 &&
      fs.existsSync(files[fileIndex]) &&
      submissionFiles &&
      submissionFiles.length > 0
    ) {
      // Declare as read
      const fTemp = [...submissionFiles];
      if (fTemp && fTemp.length > 0) {
        const i: number | undefined = fTemp.findIndex(
          (f) =>
            Path.parse(f.path).base === Path.parse(files[fileIndex]).base &&
            f.unread
        );
        if (i !== undefined && fTemp[i] !== undefined) {
          const temp = { ...fTemp[i] };
          temp.unread = false;
          fTemp[i] = temp;
          dispatch(
            submissionsUpdateOne({
              id: submissionId,
              changes: {
                files: fTemp,
              },
            })
          );
        }
      }
    }
  }, [dispatch, fileIndex, files, submissionFiles, submissionId]);

  if (files.length === 0 || !fs.existsSync(files[fileIndex])) {
    return (
      <Box height="100%">
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          style={{ height: '100%' }}
        >
          <Grid item>
            <ErrorIcon />
          </Grid>
          <Grid item>
            <Typography>File not found!</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }

  const type = mime.lookup(files[fileIndex]);
  let viewer: JSX.Element;

  switch (true) {
    case type === 'application/pdf':
      viewer = (
        <PDFViewer
          filePath={files[fileIndex]}
          scale={scale}
          rotation={rotation}
        />
      );
      break;
    case /image\/.+/.test(type):
      viewer = (
        <ImageViewer
          filePath={files[fileIndex]}
          scale={scale}
          rotation={rotation}
        />
      );
      break;
    default:
      viewer = (
        <TextViewer
          filePath={files[fileIndex]}
          scale={scale}
          rotation={rotation}
        />
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
      <ViewerToolbar
        filePaths={files}
        fileIndex={fileIndex}
        setFileIndex={setFileIndex}
        scale={scale}
        setScale={setScale}
        rotation={rotation}
        setRotation={setRotation}
      />
    </div>
  );
}
