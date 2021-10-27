/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/prop-types */
import { IconButton, TextField } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ConditionalComment from '../model/ConditionalComment';
import {
  settingsRemoveConditionalComment,
  settingsUpdateConditionalCommentText,
} from '../model/SettingsSlice';

interface ConditionalCommentTextInputProps {
  c: ConditionalComment;
  i: number;
}

const ConditionalCommentTextInput = (
  props: ConditionalCommentTextInputProps
) => {
  const { c, i } = props;
  const dispatch = useDispatch();
  const [hoverDeleteButton, setHoverDeleteButton] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <TextField
        id={`comment-${i}`}
        label={`Score ≥ ${Math.round(c.minPercentage * 100)}%`}
        name={i.toString()}
        defaultValue={c.text}
        variant="outlined"
        size="small"
        inputProps={{ maxLength: 15 }}
        onChange={(event) =>
          dispatch(
            settingsUpdateConditionalCommentText({
              index: i,
              text: event.target.value,
            })
          )
        }
        style={{
          width: '130px',
          marginRight: '8px',
          marginTop: '16px',
        }}
        onMouseEnter={() => setHoverDeleteButton(true)}
        onMouseOver={() => setHoverDeleteButton(true)}
        onMouseLeave={() => setHoverDeleteButton(false)}
      />
      <IconButton
        onClick={() => dispatch(settingsRemoveConditionalComment(i))}
        onMouseEnter={() => setHoverDeleteButton(true)}
        onMouseOver={() => setHoverDeleteButton(true)}
        onMouseLeave={() => setHoverDeleteButton(false)}
        style={{
          padding: '0px',
          position: 'absolute',
          top: '6px',
          right: '-2px',
          opacity: hoverDeleteButton ? 1 : 0,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <CancelIcon />
      </IconButton>
    </div>
  );
};
export default ConditionalCommentTextInput;
