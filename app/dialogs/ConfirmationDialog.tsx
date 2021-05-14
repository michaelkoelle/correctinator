/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@material-ui/core';
import React, { FC } from 'react';

import { ModalProps } from './ModalProvider';

type ConfimationDialogProps = DialogProps & {
  title: string;
  text: string;
  onConfirm: () => unknown;
  onReject?: () => unknown;
  onCancel?: undefined | (() => unknown);
};

const ConfirmationDialog: FC<ConfimationDialogProps> = ({
  title,
  text,
  onConfirm,
  onReject,
  onCancel,
  ...props
}) => (
  <Dialog disableBackdropClick aria-labelledby="confirm-dialog" {...props}>
    <DialogTitle id="confirm-dialog">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{text}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          (props as ModalProps).close();
          onConfirm();
        }}
        color="primary"
        autoFocus
      >
        Yes
      </Button>
      <Button
        onClick={() => {
          (props as ModalProps).close();
          if (onReject) onReject();
        }}
        color="primary"
      >
        No
      </Button>
      {onCancel && (
        <Button
          onClick={() => {
            (props as ModalProps).close();
            onCancel();
          }}
          color="default"
        >
          Cancel
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
