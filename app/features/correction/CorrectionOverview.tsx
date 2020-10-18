import {
  Box,
  Button,
  Collapse,
  Container,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import React from 'react';

export default function CorrectionOverview(props: any) {
  const [expanded, setExpanded] = React.useState(false);
  const { submission } = props;

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper>
      <Grid container spacing={3} justify="space-evenly" alignItems="center">
        <Grid item>
          {submission?.rating_done ? (
            <CheckCircleIcon color="primary" />
          ) : (
            <CancelIcon color="secondary" />
          )}
        </Grid>
        <Grid item>
          <Typography variant="h6" display="inline">
            <Box fontWeight="bold" display="inline" marginRight="10px">
              Submission ID:
            </Box>
            <Box display="inline">{submission?.submission}</Box>
          </Typography>
        </Grid>
        <Grid item>
          <div style={{ display: 'inline-flex' }}>
            <div style={{ width: '3em', textAlign: 'right' }}>
              <Typography variant="h6">{submission?.points}</Typography>
            </div>
            <Typography
              variant="h6"
              style={{ marginLeft: '0.5em', marginRight: '0.5em' }}
            >
              /
            </Typography>
            <Typography variant="h6">
              {submission?.sheet?.grading?.max}
            </Typography>
            <Typography variant="h6" style={{ marginLeft: '0.5em' }}>
              {submission?.sheet?.grading?.type}
            </Typography>
          </div>
        </Grid>
        <Grid item>
          <IconButton onClick={handleClick} aria-label="show more" size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Grid>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box padding="20px">
            <Grid item xs={12}>
              <Grid
                container
                spacing={5}
                justify="space-evenly"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="body1">
                    {`${submission?.school}`}
                  </Typography>
                  <Typography variant="body1">
                    {`${submission?.course} ${submission?.term}`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`${submission?.sheet?.name}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Type: ${submission?.sheet?.type}`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`Rated by: ${submission?.rated_by}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Rated at: ${submission?.rated_at}`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Grid>
    </Paper>
  );
}
//
