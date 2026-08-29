import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export const ProfileSkeleton: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ backgroundColor: '#e2dfd7' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={220} height={36} sx={{ backgroundColor: '#e2dfd7' }} />
            <Skeleton variant="text" width={180} height={24} sx={{ backgroundColor: '#e2dfd7' }} />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px' }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 3, backgroundColor: '#e2dfd7' }} />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '8px', backgroundColor: '#e2dfd7' }} />
      </Paper>
    </Container>
  );
};

