import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export const ComplaintCardSkeleton: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: '#ffffff',
        borderColor: '#e2e0d8',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
        <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
      </Box>

      <Skeleton variant="text" width="90%" height={32} sx={{ backgroundColor: '#e2e0d8' }} />
      <Skeleton variant="text" width="100%" height={20} sx={{ backgroundColor: '#e2e0d8' }} />
      <Skeleton variant="text" width="70%" height={20} sx={{ backgroundColor: '#e2e0d8' }} />

      <Box sx={{ pt: 2, borderTop: '1px solid #f5f3ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width={120} height={18} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
        <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
      </Box>
    </Paper>
  );
};
