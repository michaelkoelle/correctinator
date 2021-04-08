/* eslint-disable import/no-cycle */
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { CircularProgress, Typography } from '@material-ui/core';
import ViewerProps from './ViewerProps';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFViewer(props: ViewerProps) {
  const { filePath, scale, rotation } = props;

  const [numPages, setNumPages] = useState<unknown>(null);
  const [file1, setFilePath] = useState<string>();

  if (filePath !== file1) {
    // New file
    setFilePath(filePath);
    setNumPages(null);
  }

  function onDocumentLoadSuccess(doc: { numPages: unknown }) {
    setNumPages(doc?.numPages);
  }

  function removeTextLayerOffset() {
    const textLayers = document.querySelectorAll(
      '.react-pdf__Page__textContent'
    );
    textLayers.forEach((layer: any) => {
      const { style } = layer;
      style.top = '0';
      style.left = '0';
      style.transform = '';
    });
  }

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <Document
          file={filePath}
          onLoadSuccess={onDocumentLoadSuccess}
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
              onLoadSuccess={removeTextLayerOffset}
            />
          ))}
        </Document>
      )}
    </AutoSizer>
  );
}
