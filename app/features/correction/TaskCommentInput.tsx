/* eslint-disable react/jsx-props-no-spreading */
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Comment from '../../model/Comment';
import CommentEntity from '../../model/CommentEntity';
import {
  commentsUpdateOne,
  selectAllComments,
} from '../../slices/CommentSlice';
import RatingEntity from '../../model/RatingEntity';
import { ratingsUpdateOne, selectAllRatings } from '../../slices/RatingSlice';

type TaskCommentInputProps = {
  comment: Comment;
  ratingId: string;
};

function TaskCommentInput(props: TaskCommentInputProps) {
  const { comment, ratingId } = props;
  const dispatch = useDispatch();
  const comments: CommentEntity[] = useSelector(selectAllComments);
  const ratings: RatingEntity[] = useSelector(selectAllRatings);

  const options: string[] = [
    ...new Set(
      comments
        .filter(
          (c) =>
            c &&
            c.text !== '' &&
            c.task === ((comment.task.id as unknown) as string)
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

    // Overwrite rating if comment is selected
    if (reason === 'select-option') {
      const otherComment = comments.find(
        (c) => c.task === comment.task.id && c.text === value
      );
      const otherRating = ratings.find(
        (r) => r.comment === otherComment?.id && r.task === comment.task.id
      );
      if (otherRating) {
        dispatch(
          ratingsUpdateOne({
            id: ratingId,
            changes: { value: otherRating.value },
          })
        );
      }
    }
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
