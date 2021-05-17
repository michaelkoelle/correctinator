/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Grid, Typography } from '@material-ui/core';
import { version } from '../package.json';
import { ModalProps } from './ModalProvider';

type InfoModalProps = ModalProps;

const InfoModal: FC<InfoModalProps> = ({ ...props }) => {
  const { close } = props;

  return (
    <Dialog {...props} onClose={close} disableBackdropClick>
      <DialogContent style={{ overflow: 'hidden' }}>
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <img
              style={{ width: '175px', margin: '15px 30px 20px 30px' }}
              src="../resources/icon.ico"
              alt="correctinator"
            />
          </Grid>
          <Grid item style={{ marginBottom: '10px' }}>
            <Typography variant="h6">{`correctinator v${version}`}</Typography>
          </Grid>
          <Grid item style={{ marginBottom: '20px' }}>
            <Typography>by Michael Kölle</Typography>
          </Grid>
          <Grid item style={{ marginBottom: '20px' }}>
            <Button onClick={() => close()} variant="outlined">
              CLOSE
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default InfoModal;
