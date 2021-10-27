import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import Providers from './Providers';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: EnhancedStore<any, AnyAction, any[]>;
  history: History;
};

const Root = ({ store, history }: Props) => {
  return (
    <Provider store={store}>
      <Providers history={history} />
    </Provider>
  );
};

export default hot(Root);
