import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { TableSkeleton } from '@/components/ui/Skeletons/TableSkeleton';

export default function AdminLoading() {
  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f3ee', flex: 1, pb: 16 }}>
      <Container maxWidth="xl">
        <Box sx={{ pb: 3, mb: 4, borderBottom: '1px solid #e2e0d8' }}>
          <Skeleton variant="text" width={280} height={44} sx={{ backgroundColor: '#e2e0d8' }} />
          <Skeleton variant="text" width={400} height={24} sx={{ backgroundColor: '#e2e0d8' }} />
        </Box>
        <TableSkeleton />
      </Container>
    </Box>
  );
}
