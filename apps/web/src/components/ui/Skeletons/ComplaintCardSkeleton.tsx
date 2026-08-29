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
      
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="85%" height={24} sx={{ backgroundColor: '#e2dfd7', mb: 0.75 }} />
          <Skeleton variant="text" width="100%" height={18} sx={{ backgroundColor: '#f5f3ee' }} />
          <Skeleton variant="text" width="70%" height={18} sx={{ backgroundColor: '#f5f3ee' }} />
        </Box>

        <Box sx={{ pt: 1.5, borderTop: '1px solid #e2dfd7', mt: 'auto' }}>
          <Skeleton variant="text" width="60%" height={16} sx={{ backgroundColor: '#f5f3ee', mb: 0.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={90} height={16} sx={{ backgroundColor: '#f5f3ee' }} />
            <Skeleton variant="text" width={80} height={16} sx={{ backgroundColor: '#f5f3ee' }} />
          </Box>
        </Box>

        <Box sx={{ pt: 1.5, mt: 1.5, borderTop: '1px solid #e2dfd7', height: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: '8px', backgroundColor: '#e2dfd7' }} />
          <Skeleton variant="rectangular" width={75} height={20} sx={{ borderRadius: '4px', backgroundColor: '#e2dfd7' }} />
        </Box>
      </Box>

    </Paper>
  );
};

