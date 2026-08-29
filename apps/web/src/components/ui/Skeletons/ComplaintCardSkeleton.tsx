import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export const ComplaintCardSkeleton: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderColor: '#e2dfd7',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={180} sx={{ backgroundColor: '#e2dfd7' }} />
      
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: '9999px', backgroundColor: '#e2dfd7' }} />
          <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: '9999px', backgroundColor: '#e2dfd7' }} />
        </Box>

        <Skeleton variant="text" width="90%" height={28} sx={{ backgroundColor: '#e2dfd7' }} />
        <Skeleton variant="text" width="100%" height={20} sx={{ backgroundColor: '#f5f3ee' }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ backgroundColor: '#f5f3ee' }} />

        <Box sx={{ pt: 2, borderTop: '1px solid #e2dfd7', mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: '8px', backgroundColor: '#e2dfd7' }} />
          <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: '4px', backgroundColor: '#e2dfd7' }} />
        </Box>
      </Box>
    </Paper>
  );
};

