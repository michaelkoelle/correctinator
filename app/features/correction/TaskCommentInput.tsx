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

  const options: string[] = [
    ...new Set(
      comments
        .filter(
          (c) =>
            c &&
            c.text !== '' &&
            c.task === ((comment.task as unknown) as string)
        )
        .map((c) => c.text)
    ),
  ];

  function onChangeComment(e) {
    dispatch(
      commentsUpdateOne({ id: comment.id, changes: { text: e.target.value } })
    );
  }

  function onChangeAutocomplete(event, value, reason) {
    dispatch(
      commentsUpdateOne({
        id: comment.id,
        changes: { text: value || '' },
      })
    );
  }

  return (
    <Autocomplete
      id="combo-box-demo"
      options={options}
      freeSolo
      onChange={onChangeAutocomplete}
      value={comment.text}
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
