/* eslint-disable react/jsx-props-no-spreading */
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SplitPane from 'react-split-pane';
import CorrectionView from '../features/correction/CorrectionView';
import MediaViewer from '../features/correction/MediaViewer';
import { getSubmissionsOfSheet } from '../utils/FileAccess';
import './SplitPane.css';

export default function CorrectionViewPage(props: any) {
  const [openDialog, setOpenDialog] = useState(false);
  const workspacePath = useSelector((state: any) => state.workspace.path);
  const {
    corrections,
    setCorrections,
    sheets,
    setSheetToCorrect,
    index,
    setIndex,
  } = props;

  function handleCloseDialog() {
    setOpenDialog(false);
  }

  function missingSchemas(sheet) {
    return (
      getSubmissionsOfSheet(sheet, workspacePath).filter(
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
          <CorrectionView {...props} />
        </div>
        <div style={{ height: '100%', margin: '0 5px 0 0' }}>
          <MediaViewer files={corrections[index]?.files} />
        </div>
      </SplitPane>
      {sheets.filter((s) => !missingSchemas(s)).length > 0 ? (
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
      ) : (
        <Dialog onClose={handleCloseDialog} open={openDialog}>
          <DialogContent>
            <DialogContentText style={{ textAlign: 'center' }}>
              No sheets to correct
            </DialogContentText>
            {sheets.length > 0 ? (
              <DialogContentText style={{ textAlign: 'center' }}>
                Have you forgot to assign a correction schema?
              </DialogContentText>
            ) : (
              <DialogContentText style={{ textAlign: 'center' }}>
                You need to import some submissions first
              </DialogContentText>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
