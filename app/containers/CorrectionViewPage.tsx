import { Button, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import SplitPane from 'react-split-pane';
import CorrectionView from '../features/correction/CorrectionView';
import MediaViewer from '../features/correction/MediaViewer';
import './SplitPane.css';

export default function CorrectionViewPage(props: any) {
  const [index, setIndex] = useState(0);
  const { corrections, setCorrections } = props;

  return (
    <SplitPane
      style={{
        position: 'relative',
        padding: '5px',
        height: 'calc(100% - 40px)',
      }}
      split="vertical"
      minSize={50}
      defaultSize="45%"
      allowResize
    >
      <div style={{ height: '100%', margin: '0 10px 0 0' }}>
        <CorrectionView
          corrections={corrections}
          index={index}
          setIndex={setIndex}
          setCorrections={setCorrections}
        />
      </div>
      <div style={{ height: '100%', margin: '0 5px 0 0' }}>
        <MediaViewer files={corrections[index]?.files} />
      </div>
    </SplitPane>
  );
}
