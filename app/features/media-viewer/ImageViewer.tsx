import React from 'react';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import ViewerProps from './ViewerProps';

export default function ImageViewer(props: ViewerProps) {
  const { filePath, scale, rotation } = props;

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <img
          src={filePath}
          alt={filePath}
          style={{
            width: width - 20,
            transform: `rotate(${rotation}deg) scale(${scale})`,
          }}
        />
      )}
    </AutoSizer>
  );
}
