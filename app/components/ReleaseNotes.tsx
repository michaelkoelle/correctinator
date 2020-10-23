/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function ReleaseNotes(props: any) {
  const { open, handleClose, releaseNotes, title } = props;
  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h5">{title}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <div dangerouslySetInnerHTML={{ __html: releaseNotes }} />
      </DialogContent>
    </Dialog>
  );
}
