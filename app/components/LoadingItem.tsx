import { Grid, CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import DoneIcon from '@material-ui/icons/Done';

export type LoadingItemProps = {
  complete: boolean;
  message: string;
};

export default function LoadingItem(props: LoadingItemProps): JSX.Element {
  const { complete, message } = props;
  const loadingIcon = complete ? (
    <DoneIcon style={{ fill: 'black' }} />
  ) : (
    <CircularProgress />
  );
  return (
    <Grid container spacing={3} justify="center" alignItems="center">
      <Grid item>{loadingIcon}</Grid>
      <Grid item>
        <Typography>{message}</Typography>
      </Grid>
    </Grid>
  );
}
