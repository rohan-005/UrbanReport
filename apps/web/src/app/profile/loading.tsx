import React from 'react';
import { ProfileSkeleton } from '@/components/ui/Skeletons/ProfileSkeleton';
import Box from '@mui/material/Box';

export default function ProfileLoading() {
  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f3ee', flex: 1, pb: 16 }}>
      <ProfileSkeleton />
    </Box>
  );
}
