/* eslint-disable react/jsx-pascal-case */
/* eslint-disable react/jsx-props-no-spreading */
import React, { createContext, FC, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ModalProviderProps {
  children;
}

export interface ModalProps {
  open: boolean;
  close: () => void;
}

interface ModalConfig<T> {
  options: T;
  component: FC<T & ModalProps>;
}

const ModalContext = createContext<
  <T>(component: FC<T & ModalProps>, options?: T) => void
>(() => undefined);

export default function ModalProvider(props: ModalProviderProps) {
  const { children } = props;
  const [modalList, setModalList] = useState<ModalConfig<unknown>[]>([]);

  const openModal = <T extends unknown>(
    component: FC<T & ModalProps>,
    options: T
  ) => {
    setModalList([
      ...modalList,
      { options, component: component as FC<ModalProps> },
    ]);
  };

  const closeModal = (index: number) => {
    setModalList(modalList.filter((_, i) => index !== i));
  };

  return (
    <ModalContext.Provider value={openModal}>
      {children}
      {modalList.map((Modal, i) => (
        <Modal.component
          key={uuidv4()}
          open={Boolean(Modal.component)}
          close={() => closeModal(i)}
          {...Modal.options}
        />
      ))}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
