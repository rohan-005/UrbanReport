import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { ComplaintCardSkeleton } from '@/components/ui/Skeletons/ComplaintCardSkeleton';

export default function ComplaintsLoading() {
  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f3ee', flex: 1, pb: 16 }}>
      <Container maxWidth="xl">
        <Box sx={{ pb: 3, mb: 4, borderBottom: '1px solid #e2e0d8' }}>
          <Skeleton variant="text" width={300} height={48} sx={{ backgroundColor: '#e2e0d8' }} />
          <Skeleton variant="text" width={450} height={24} sx={{ backgroundColor: '#e2e0d8' }} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <ComplaintCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
