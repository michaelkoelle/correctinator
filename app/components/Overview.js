// @flow
import React, { Component } from 'react';
import { connect } from "react-redux";

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import { bindActionCreators } from 'redux';
import { nextSubmission, prevSubmission, setCurrentRow } from '../actions/actionCreators';


type Props = {
  current: {}
};

class Overview extends Component<Props>{
  props: Props;

  render() {
    /*const useStyles = makeStyles(theme => ({
      root: {
        flexGrow: 1,
      },
      paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
      },
      grid: {
        margin: 5,
      }
    }));
     */

    //const classes = useStyles();
    const {current} = this.props;
    const {submissionId, rating, maxpoints} = current;

    return (
      <div>
        <Paper>
          <Grid
            container
            direction="row"
            justify="space-evenly"
            alignItems="center"
          >
            <Grid item xs={6}>
              <div>
                <Typography variant="h5" gutterBottom={false}>
                  <b>Submission-Id: </b>{submissionId}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div>
                <Typography variant="h5" gutterBottom={false}>
                  <b>Rating: </b>{rating}/{maxpoints} Points
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Button variant="contained" color="default" onClick={() => this.props.prevSubmission()}>
                  <i className="fas fa-arrow-circle-left"/>&nbsp;BACK
                </Button>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Button variant="contained" color="secondary" onClick={() => /* TODO */ console.log("MARKED")}>
                  <i className="far fa-sticky-note"/>&nbsp;ADD NOTE
                </Button>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Button variant="contained" color="primary" onClick={() => this.props.nextSubmission()}>
                  NEXT&nbsp;<i className="fas fa-arrow-circle-right"/>
                </Button>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  };
}

const mapStateToProps = (state) => {
  if(state.project.current !== undefined && state.project.submissions && state.project.submissions.length > 0){
    return {
      current: state.project.submissions[state.project.current]
    };
  }
  return {current: {}};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ nextSubmission, prevSubmission }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview)
