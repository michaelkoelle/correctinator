/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import React, { FC } from 'react';
import { useAppDispatch } from '../store';

import { ModalProps } from '../modals/ModalProvider';

type InformationDialogProps = ModalProps & {
  title: string;
  text?: string;
  onOK: (dispatch?) => unknown;
};

const InformationDialog: FC<InformationDialogProps> = ({
  title,
  text,
  onOK,
  ...props
}) => {
  const dispatch = useAppDispatch();
  return (
    <Dialog disableBackdropClick aria-labelledby="info-dialog" {...props}>
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      {text && (
        <DialogContent>
          <DialogContentText>{text}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button
          onClick={() => {
            props.close();
            onOK(dispatch);
          }}
          color="primary"
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InformationDialog;
