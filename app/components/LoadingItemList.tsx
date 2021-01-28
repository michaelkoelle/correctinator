import { List, ListItem } from '@material-ui/core';
import React from 'react';
import LoadingItem from './LoadingItem';

export default function LoadingItemList(props: any): JSX.Element {
  const { progress } = props;
  const activeItems = progress.filter(
    (item: { active: boolean }) => item.active
  );

  return (
    <List>
      {activeItems.map((item: { message: string; complete: boolean }) => {
        return (
          <ListItem key={item.message}>
            <LoadingItem message={item.message} complete={item.complete} />
          </ListItem>
        );
      })}
    </List>
  );
}
