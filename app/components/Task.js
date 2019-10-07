// @flow
import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Paper, TextField, Typography, Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';

function Task(props) {
  console.log(props);
  /*
  if(props.current.tasks){
    const task = props.current.tasks[0];
    const {comment, name, rating, maxpoints, subtasks} = task;
    console.log(task);

    const flatTasks = dfs({subtasks: props.current.tasks});
    const test = flatTasks.map(task => <TaskLabel task={task}/>);

    return (
      <Paper>
        {test}
      </Paper>
    );
  }
  */
  return(<div/>);
}

function dfs(node, res = []) {

  if(node && !node.subtasks.isEmpty){
    res.push(node);
    console.log(res);
    node.subtasks.forEach(task => {
      dfs(task, res);
    });
  }
  const [first, ...rest] = res;
  return rest;
}

function TaskEdit(props){
  let {name, rating, maxpoints} = props.task;
  const handleChange = event => {
    console.log(event.target.value);
    rating = event.target.value*0.5;
  };
  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Typography variant="h5" gutterBottom={false}>
            <b>{name} </b>
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="outlined-number"
            label="Rating"
            value={rating}
            onChange={handleChange}
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h5" gutterBottom={false}>
            /{maxpoints} Points
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="outlined-dense-multiline"
            label="Comment"
            margin="dense"
            variant="outlined"
            multiline
            rowsMax="4"
          />
        </Grid>
      </Grid>
    </div>
  )
}

function TaskLabel(props){
  const {name, rating, maxpoints, comment} = props.task;
  return (
    <Typography variant="h5" gutterBottom={false}>
      <b>{name} </b>{rating}/{maxpoints} Points
    </Typography>
  )
}

const mapStateToProps = (state) => {
  if(state.project.current !== undefined && state.db.entities && state.db.entities.submissionCorrections){
    console.log(state.db.entities.submissionCorrections);
    console.log(state.db.entities.submissionCorrections[state.project.current]);
    return {
      current: state.db.entities.submissionCorrections[state.project.current]
    };
  }
  return {current: {}};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task)
