import { List, ListItem } from '@material-ui/core';
import React from 'react';
import LoadingItem, { LoadingItemProps } from './LoadingItem';

type LoadingItemListProps = {
  progress: (LoadingItemProps & { active: boolean })[];
};

export default function LoadingItemList(
  props: LoadingItemListProps
): JSX.Element {
  const { progress } = props;
  const activeItems = progress.filter((item) => item.active);

  return (
    <List>
      {activeItems.map((item) => {
        return (
          <ListItem key={item.message}>
            <LoadingItem message={item.message} complete={item.complete} />
          </ListItem>
        );
      })}
    </List>
  );
}
