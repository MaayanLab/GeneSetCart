import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

export function LinearIndeterminate() {
  return (
    <Box sx={{ padding: 2, width: '100%'}}>
      <LinearProgress color='secondary' />
    </Box>
  );
}

export default function CircularIndeterminate() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress color='secondary'/>
    </Box>
  );
}