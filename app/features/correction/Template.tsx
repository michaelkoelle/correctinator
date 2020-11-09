import { Paper, Box, TextField, Typography } from '@material-ui/core';
import React from 'react';

function Template(props: any) {
  const { correction, setCorrection } = props;

  return (
    <div>
      <Typography>Test</Typography>
    </div>
  );
}

export default React.memo(Template);
