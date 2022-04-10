import React from 'react';
import fs from 'fs';
import AceEditor from 'react-ace';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import Modelist from 'ace-builds/src-noconflict/ext-modelist';
import 'ace-builds/webpack-resolver';
import { useSelector } from 'react-redux';
import ViewerProps from './ViewerProps';
import { selectSettingsGeneral } from '../../slices/SettingsSlice';
import { shouldUseDarkColors } from '../../model/Theme';

export default function TextViewer(props: ViewerProps) {
  const { filePath, scale } = props;
  const { theme } = useSelector(selectSettingsGeneral);
  const data = fs.readFileSync(filePath, 'UTF-8') + '\n'.repeat(6);
  const mode = Modelist.getModeForPath(filePath);

  return (
    <AutoSizer>
      {({ width, height }) => (
        <AceEditor
          fontSize={12 * scale}
          readOnly
          showPrintMargin={false}
          mode={mode.name}
          theme={shouldUseDarkColors(theme) ? 'twilight' : 'textmate'}
          width={`${width - 20}px`}
          maxLines={Infinity}
          style={{ minHeight: height }}
          value={data}
          wrapEnabled
          name="editor"
          editorProps={{ $blockScrolling: true }}
        />
      )}
    </AutoSizer>
  );
}
