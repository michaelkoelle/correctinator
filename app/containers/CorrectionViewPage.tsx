import {
  Button,
  Dialog,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import CorrectionView from '../features/correction/CorrectionView';
import MediaViewer from '../features/correction/MediaViewer';
import { getSubmissionsOfSheet } from '../utils/FileAccess';
import './SplitPane.css';

export default function CorrectionViewPage(props: any) {
  const [index, setIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const { corrections, setCorrections, sheets, setSheetToCorrect } = props;

  function handleCloseDialog() {
    setOpenDialog(false);
  }

  function missingSchemas(sheet) {
    return (
      getSubmissionsOfSheet(sheet).filter(
        (s) => s?.tasks === undefined || s?.tasks?.length === 0
      ).length > 0
    );
  }

  if (corrections === undefined || corrections.length <= 0) {
    if (openDialog !== true) {
      setOpenDialog(true);
    }
  }

  return (
    <>
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
      <Dialog onClose={handleCloseDialog} open={openDialog}>
        <DialogTitle>Choose sheet to correct</DialogTitle>
        <List>
          {sheets
            .filter((s) => !missingSchemas(s))
            .map((sheet) => (
              <ListItem
                button
                onClick={() => {
                  setSheetToCorrect(sheet);
                  setOpenDialog(false);
                }}
                key={
                  sheet.term + sheet.school + sheet.course + sheet.sheet.name
                }
              >
                <ListItemText
                  primary={sheet.sheet.name}
                  secondary={`${sheet.course} - ${sheet.term} - ${sheet.rated_by}`}
                />
              </ListItem>
            ))}
        </List>
      </Dialog>
    </>
  );
}
