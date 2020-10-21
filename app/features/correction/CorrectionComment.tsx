import { Paper, Box, TextField } from '@material-ui/core';
import React from 'react';
import TaskCorrectionList from './TaskCorrectionList';

export default function CorrectionComment(props: any) {
  const { correction, setCorrection } = props;

  function onChangeComment(event) {
    const temp = { ...correction };
    temp.comment = event.target.value;
    setCorrection(temp);
  }

  const commentValue =
    correction?.comment === undefined ? '' : correction?.comment;

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
