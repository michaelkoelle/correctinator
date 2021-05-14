/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

interface DialogProviderProps {
  children;
}

export interface DialogOptions {
  title: string;
  text: string;
  onConfirm: () => unknown;
  onReject?: () => unknown;
  onCancel?: undefined | (() => unknown);
}

const DialogContext = React.createContext<(options: DialogOptions) => void>(
  () => undefined
);

export default function DialogProvider(props: DialogProviderProps) {
  const { children } = props;
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(
    null
  );

  const openDialog = (options: DialogOptions) => {
    setDialogOptions(options);
    return Promise.resolve();
  };

  return (
    <DialogContext.Provider value={openDialog}>
      {children}
      <ConfirmDialog
        open={Boolean(dialogOptions)}
        setOpen={() => setDialogOptions(null)}
        {...dialogOptions}
      />
    </DialogContext.Provider>
  );
}

export const useDialog = () => React.useContext(DialogContext);
