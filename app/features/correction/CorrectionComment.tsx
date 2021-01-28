import { Paper, TextField } from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import Correction from '../../model/Correction';
import { upsertCorrection } from '../../model/CorrectionsSlice';

type CorrectionCommentProps = {
  correction: Correction | undefined;
};

export default function CorrectionComment(props: CorrectionCommentProps) {
  const { correction } = props;

  const dispatch = useDispatch();

  function onChangeComment(event) {
    if (correction) {
      const temp: Correction = { ...correction };
      if (temp.annotation) {
        temp.annotation.text = event.target.value;
      } else {
        temp.annotation = {
          id: uuidv4(),
          text: event.target.value,
        };
      }
      dispatch(upsertCorrection(temp));
    }
  }

  const commentValue =
    correction && correction.annotation ? correction?.annotation.text : '';

  return (
    <Paper style={{ padding: '15px' }}>
      <TextField
        id="comment"
        label="Additional comments"
        multiline
        name="comment"
        value={commentValue}
        onChange={onChangeComment}
        variant="outlined"
        size="small"
        fullWidth
        disabled={correction === undefined}
      />
    </Paper>
  );
}
