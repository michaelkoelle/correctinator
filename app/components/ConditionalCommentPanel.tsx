/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {
  Collapse,
  Grid,
  Paper,
  Slider,
  Switch,
  TextField,
  Tooltip,
} from '@material-ui/core';

const PrimaryTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

function ValueLabelComponent(props: any) {
  const { children, open, value, comments } = props;
  return (
    <PrimaryTooltip
      open={open}
      hidden={!open}
      placement="top"
      title={`${comments[children.props['data-index']]} ≥ ${value}`}
      arrow
    >
      {children}
    </PrimaryTooltip>
  );
}

export interface ConditionalCommentProps {
  conditionalComment;
  setConditionalComment;
  showLabel;
  setShowLabel;
  value;
  setValue;
  comments;
  setComments;
}

const ConditionalCommentPanel = (props: ConditionalCommentProps) => {
  const {
    conditionalComment,
    setConditionalComment,
    showLabel,
    setShowLabel,
    value,
    setValue,
    comments,
    setComments,
  } = props;

  const marks = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: 25,
      label: '25%',
    },
    {
      value: 50,
      label: '50%',
    },
    {
      value: 75,
      label: '75%',
    },
    {
      value: 100,
      label: '100%',
    },
  ];

  function onToggleConditionalComment() {
    setConditionalComment(!conditionalComment);
    // Workaround for using tooltips
    if (showLabel) {
      setShowLabel(false);
    } else {
      setTimeout(() => {
        setShowLabel(true);
      }, 300);
    }
  }

  function onChangeSlider(event, newValue) {
    setValue(newValue);
  }

  function onChangeComment(event) {
    const temp = [...comments];
    temp[event.target.name] = event.target.value;
    setComments(temp);
  }

  return (
    <Grid container direction="row" justify="flex-start" alignItems="center">
      <Grid
        item
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="h6">Conditional Comment</Typography>
        </Grid>
        <Grid item>
          <Switch
            checked={conditionalComment}
            onChange={onToggleConditionalComment}
          />
        </Grid>
      </Grid>
      <Collapse in={conditionalComment} style={{ width: '100%' }}>
        <Grid container justify="center" alignItems="center">
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              style={{
                padding: '50px 50px 10px',
                marginTop: '16px',
                marginBottom: '16px',
                width: 'calc(100%)',
              }}
            >
              <Slider
                value={value}
                valueLabelDisplay="on"
                marks={marks}
                onChange={onChangeSlider}
                ValueLabelComponent={(p) => (
                  <ValueLabelComponent
                    {...p}
                    comments={comments}
                    open={showLabel}
                  />
                )}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid container justify="flex-start" alignItems="center">
          <Grid item xs={12}>
            <Typography>Options:</Typography>
          </Grid>
          {comments.map((c, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Grid key={`comment-${i}`} item>
              <TextField
                id={`comment-${i}`}
                label={`Score ≥ ${value[i]}%`}
                name={i.toString()}
                defaultValue={c}
                variant="outlined"
                size="small"
                onChange={onChangeComment}
                style={{
                  width: '120px',
                  marginRight: '16px',
                  marginTop: '16px',
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Grid>
  );
};

export default ConditionalCommentPanel;
