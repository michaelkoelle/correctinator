/* eslint-disable import/no-cycle */
import React from 'react';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

export default function ImageViewer(props: any) {
  const { file, scale, rotation } = props;

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <img
          src={file}
          alt={file}
          style={{
            width: width - 20,
            transform: `rotate(${rotation}deg) scale(${scale})`,
          }}
        />
      )}
    </AutoSizer>
  );
}
