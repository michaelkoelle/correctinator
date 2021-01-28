/* eslint-disable react/jsx-props-no-spreading */
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Comment from '../../model/Comment';
import CommentEntity from '../../model/CommentEntity';
import { commentsUpdateOne, selectAllComments } from '../../model/CommentSlice';

type TaskCommentInputProps = {
  comment: Comment;
};

function TaskCommentInput(props: TaskCommentInputProps) {
  const { comment } = props;
  const dispatch = useDispatch();
  const comments: CommentEntity[] = useSelector(selectAllComments);

  function onChangeComment(e) {
    dispatch(
      commentsUpdateOne({ id: comment.id, changes: { text: e.target.value } })
    );
  }

  return (
    <Autocomplete
      id="combo-box-demo"
      options={comments
        .filter((c) => c.task === comment.task.id)
        .map((c) => c.id)}
      freeSolo
      value={comment.text}
      onChange={onChangeComment}
      renderInput={(params) => (
        <TextField
          {...params}
          id="comment"
          label="Comment"
          multiline
          name="comment"
          onChange={onChangeComment}
          variant="outlined"
          size="small"
          fullWidth
        />
      )}
    />
  );
}

export default TaskCommentInput;
