/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { CircularProgress, Grid, useTheme } from '@material-ui/core';

export default function ReleaseNotes(props: any) {
  const { open, handleClose, releaseNotes, title } = props;
  const theme = useTheme();

  let releaseNotesEdited = '';
  const temp = releaseNotes?.toString().split('\n');
  if (temp) {
    const tempRest = temp.slice(1);
    releaseNotesEdited = tempRest
      .join('\n')
      .replaceAll(
        '<a href',
        `<span style='color:${theme.palette.text.disabled};' id`
      )
      .replaceAll('</a>', '</span>');
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      {releaseNotes?.length > 0 ? (
        <>
          <DialogTitle disableTypography>
            <Typography variant="h5">{title}</Typography>
          </DialogTitle>
          <DialogContent dividers>
            <div dangerouslySetInnerHTML={{ __html: releaseNotesEdited }} />
          </DialogContent>
        </>
      ) : (
        <DialogContent>
          <Grid
            container
            justify="center"
            alignItems="center"
            style={{ height: '200px' }}
          >
            <Grid item>
              <CircularProgress />
            </Grid>
          </Grid>
        </DialogContent>
      )}
    </Dialog>
  );
}
