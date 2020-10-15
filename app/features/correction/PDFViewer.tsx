/* eslint-disable import/no-cycle */
import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import path from 'path';
import ErrorIcon from '@material-ui/icons/Error';
import {
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@material-ui/core';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFViewer(props: any) {
  const [numPages, setNumPages] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const { file, scale, rotation } = props;

  if (file !== filePath) {
    // New file
    setFilePath(file);
    setNumPages(null);
  }

  function onDocumentLoadSuccess(doc: any) {
    setNumPages(doc?.numPages);
  }

  function onError(error) {
    console.log(error);
  }

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onError}
          onSourceError={onError}
          error={
            <Typography variant="h6">File could not be loaded!</Typography>
          }
          loading={<CircularProgress />}
        >
          {[...Array(numPages).keys()].map((i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={width - 20}
              scale={scale}
              rotate={rotation}
            />
          ))}
        </Document>
      )}
    </AutoSizer>
  );
}
