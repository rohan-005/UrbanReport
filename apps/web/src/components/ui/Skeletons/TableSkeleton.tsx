import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export const TableSkeleton: React.FC = () => {
  return (
    <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: '2px', backgroundColor: '#f5f3ee' }} />
        ))}
      </Box>
    </Paper>
  );
};
