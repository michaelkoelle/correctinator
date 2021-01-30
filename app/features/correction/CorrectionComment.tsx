import { Paper, TextField } from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  annotationsUpdateOne,
  annotationsUpsertOne,
} from '../../model/AnnotationSlice';
import Correction from '../../model/Correction';
import { correctionsUpdateOne } from '../../model/CorrectionsSlice';

type CorrectionCommentProps = {
  correction: Correction | undefined;
};

export default function CorrectionComment(props: CorrectionCommentProps) {
  const { correction } = props;

  const dispatch = useDispatch();

  function onChangeAnnotation(event) {
    if (correction) {
      if (correction.annotation) {
        dispatch(
          annotationsUpdateOne({
            id: correction.annotation.id,
            changes: { text: event.target.value },
          })
        );
      } else {
        const annotation = {
          id: uuidv4(),
          text: event.target.value,
        };
        dispatch(annotationsUpsertOne(annotation));
        dispatch(
          correctionsUpdateOne({
            id: correction.id,
            changes: { annotation: annotation.id },
          })
        );
      }
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
        onChange={onChangeAnnotation}
        variant="outlined"
        size="small"
        fullWidth
        disabled={correction === undefined}
      />
    </Paper>
  );
}
