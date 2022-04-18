/* eslint-disable react/jsx-props-no-spreading */
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SplitPane from 'react-split-pane';
import CorrectionView from '../features/correction/CorrectionView';
import MediaViewer from '../features/media-viewer/MediaViewer';
import {
  correctionPageSetSheetId,
  correctionPageSetTimeStart,
  selectCorrectionPageIndex,
  selectCorrectionPageSheetId,
  selectCorrectionPageTimeStart,
} from '../slices/CorrectionPageSlice';
import { correctionsUpdateOne } from '../slices/CorrectionsSlice';
import {
  selectAllSheetsDenormalized,
  selectCorrectionsBySheetId,
} from '../model/Selectors';

import Sheet from '../model/Sheet';
import { serializeTerm } from '../utils/Formatter';
import './SplitPane.css';

export default function CorrectionViewPage() {
  const dispatch = useDispatch();
  const index = useSelector(selectCorrectionPageIndex);
  const sheetId = useSelector(selectCorrectionPageSheetId);
  const sheets: Sheet[] = useSelector(selectAllSheetsDenormalized);
  const corrections = useSelector(selectCorrectionsBySheetId(sheetId));
  const timeStart: Date | undefined = useSelector(
    selectCorrectionPageTimeStart
  );

  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);

  // Effects
  useEffect(() => {
    const start = new Date();
    dispatch(correctionPageSetTimeStart(start.toISOString()));
    return () => {
      const end = new Date();
      const diff = end.getTime() - start.getTime();
      if (corrections && corrections[index]) {
        dispatch(
          correctionsUpdateOne({
            id: corrections[index].id,
            changes: {
              timeElapsed: corrections[index].timeElapsed
                ? corrections[index].timeElapsed + diff
                : diff,
            },
          })
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function handleCloseDialog() {
    setOpenDialog(false);
  }

  function isInitialized(sheet: Sheet) {
    return sheet.tasks && sheet.tasks.length > 0;
  }

  function onSelectSheet(id: string) {
    dispatch(correctionPageSetSheetId(id));
    setOpenDialog(false);
  }

  const targetSheet = sheets.find((s) => s.id === sheetId);
  if (sheetId === undefined) {
    if (openDialog !== true) {
      setOpenDialog(true);
    }
  } else if (
    !sheets.map((s) => s.id).includes(sheetId) ||
    (targetSheet && !isInitialized(targetSheet))
  ) {
    dispatch(correctionPageSetSheetId(undefined));
    if (openDialog !== true) {
      setOpenDialog(true);
    }
  } else if (openDialog) {
    setOpenDialog(false);
  }

  return (
    <>
      <SplitPane
        style={{
          position: 'relative',
          padding: '5px',
          height: 'calc(100% - 40px)',
          userSelect: 'none',
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
            timeStart={timeStart}
          />
        </div>
        <div style={{ height: '100%', margin: '0 5px 0 0' }}>
          <MediaViewer
            submissionName={corrections[index]?.submission?.name}
            submissionId={corrections[index]?.submission?.id}
            submissionFiles={corrections[index]?.submission?.files}
          />
        </div>
      </SplitPane>
      {sheets.filter((s) => isInitialized(s)).length > 0 ? (
        <Dialog onClose={handleCloseDialog} open={openDialog}>
          <DialogTitle>Choose sheet to correct</DialogTitle>
          <List>
            {sheets
              .filter((s) => isInitialized(s))
              .map((sheet) => (
                <ListItem
                  button
                  onClick={() => onSelectSheet(sheet.id)}
                  key={sheet.id}
                >
                  <ListItemText
                    primary={sheet.name}
                    secondary={`${sheet.course.name} - ${serializeTerm(
                      sheet.term
                    )}`}
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
                Have you forgot to assign a task schema?
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
