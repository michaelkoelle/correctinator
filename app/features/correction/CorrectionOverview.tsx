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
          <Typography variant="h6" display="inline">
            <Box display="inline" marginRight="10px">
              {submission?.points}
            </Box>
            <Box display="inline" marginRight="10px">
              /
            </Box>
            <Box display="inline" marginRight="10px">
              {submission?.sheet?.grading?.max}
            </Box>
            <Box display="inline">{submission?.sheet?.grading?.type}</Box>
          </Typography>
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
                    <Box>{submission?.school}</Box>
                    <Box display="inline" marginRight="10px">
                      {submission?.course}
                    </Box>
                    <Box display="inline">{submission?.term}</Box>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    <Box>{submission?.sheet?.name}</Box>
                    <Box>
                      <Box display="inline" marginRight="10px">
                        Type:
                      </Box>
                      {submission?.sheet?.type}
                    </Box>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    <Box>
                      <Box display="inline" marginRight="10px">
                        Rated by:
                      </Box>
                      {submission?.rated_by}
                    </Box>
                    <Box>
                      <Box display="inline" marginRight="10px">
                        Rated at:
                      </Box>
                      {submission?.rated_at}
                    </Box>
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
