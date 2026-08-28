import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';

export const ComplaintDetailSkeleton: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Skeleton variant="text" width={200} height={28} sx={{ mb: 3, backgroundColor: '#e2e0d8' }} />

      <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Skeleton variant="rectangular" width={90} height={24} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
        </Box>
        <Skeleton variant="text" width="70%" height={48} sx={{ mb: 2, backgroundColor: '#e2e0d8' }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ backgroundColor: '#e2e0d8' }} />
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', mb: 3 }}>
            <Skeleton variant="text" width={140} height={28} sx={{ mb: 2, backgroundColor: '#e2e0d8' }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
            <Skeleton variant="text" width={160} height={28} sx={{ mb: 3, backgroundColor: '#e2e0d8' }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '2px', backgroundColor: '#e2e0d8' }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
