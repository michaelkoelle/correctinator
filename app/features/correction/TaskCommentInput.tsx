/* eslint-disable react/jsx-props-no-spreading */
import { Paper, Box, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';

function TaskCommentInput(props: any) {
  const { comment, acOptions, handleChange, onChangeComment } = props;

  console.log('render comment');

  return (
    <Autocomplete
      id="combo-box-demo"
      options={acOptions}
      freeSolo
      value={comment}
      onChange={onChangeComment}
      renderInput={(params) => (
        <TextField
          {...params}
          id="comment"
          label="Comment"
          multiline
          name="comment"
          // value={task.comment}
          onChange={handleChange}
          variant="outlined"
          size="small"
          fullWidth
        />
      )}
    />
  );
}

export default React.memo(TaskCommentInput);
