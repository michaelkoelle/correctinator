import { Box, List, ListItem, Paper, Typography } from '@material-ui/core';
import React from 'react';
import SheetEntity from '../../model/SheetEntity';
import SheetCard from './SheetCard';

interface SheetCardListProps {
  sheets: SheetEntity[];
}

export default function SheetCardList(props: SheetCardListProps) {
  const { sheets } = props;

  if (sheets?.length > 0) {
    return (
      <List
        style={{
          flex: '1 1 0px',
          overflow: 'auto',
        }}
      >
        {sheets.map((sheet) => {
          return <SheetCard key={sheet.id} sheet={sheet} />;
        })}
      </List>
    );
  }
  return null;
}
