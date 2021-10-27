/* eslint-disable react/jsx-props-no-spreading */
import React, { createContext, FC, useContext, useState } from 'react';

interface ModalProviderProps {
  children;
}

export interface ModalProps {
  open: boolean;
  close: () => void;
}

const ModalContext = createContext<
  <T>(component: FC<T & ModalProps>, options?: T) => void
>(() => undefined);

export default function ModalProvider(props: ModalProviderProps) {
  const { children } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Modal, setModal] = useState<any>(null);
  const [modalOptions, setModalOptions] = useState<unknown>(null);

  const openModal = <T extends unknown>(
    component: FC<T & ModalProps>,
    options: T
  ) => {
    setModalOptions(options);
    setModal(() => component);
  };

  const closeModal = () => {
    setModal(null);
    setModalOptions(null);
  };

  return (
    <ModalContext.Provider value={openModal}>
      {children}
      {Modal !== null && modalOptions !== null && (
        <Modal open={Boolean(Modal)} close={closeModal} {...modalOptions} />
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
