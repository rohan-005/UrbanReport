import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export default function ReportLoading() {
  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f3ee', flex: 1, pb: 6 }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
          <Skeleton variant="text" width={280} height={40} sx={{ mb: 1, backgroundColor: '#e2e0d8' }} />
          <Skeleton variant="text" width={400} height={24} sx={{ mb: 4, backgroundColor: '#e2e0d8' }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '2px', backgroundColor: '#f5f3ee' }} />
        </Paper>
      </Container>
    </Box>
  );
}
