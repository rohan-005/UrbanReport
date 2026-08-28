import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export const ProfileSkeleton: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Skeleton variant="rectangular" width={64} height={64} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={220} height={36} sx={{ backgroundColor: '#e2e0d8' }} />
            <Skeleton variant="text" width={180} height={24} sx={{ backgroundColor: '#e2e0d8' }} />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 3, backgroundColor: '#e2e0d8' }} />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
      </Paper>
    </Container>
  );
};
