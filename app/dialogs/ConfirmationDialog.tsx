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

import { ModalProps } from './ModalProvider';

type ConfimationDialogProps = ModalProps & {
  title: string;
  text: string;
  onConfirm: (dispatch?) => unknown;
  onReject?: (dispatch?) => unknown;
  onCancel?: undefined | ((dispatch?) => unknown);
};

const ConfirmationDialog: FC<ConfimationDialogProps> = ({
  title,
  text,
  onConfirm,
  onReject,
  onCancel,
  ...props
}) => {
  const dispatch = useAppDispatch();
  return (
    <Dialog disableBackdropClick aria-labelledby="confirm-dialog" {...props}>
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            props.close();
            onConfirm(dispatch);
          }}
          color="primary"
          autoFocus
        >
          Yes
        </Button>
        <Button
          onClick={() => {
            props.close();
            if (onReject) onReject(dispatch);
          }}
          color="primary"
        >
          No
        </Button>
        {onCancel && (
          <Button
            onClick={() => {
              props.close();
              onCancel(dispatch);
            }}
            color="default"
          >
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
