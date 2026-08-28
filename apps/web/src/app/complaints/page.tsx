'use client';

import React, { useEffect, useState } from 'react';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintFilters } from '@/lib/types';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { ComplaintFiltersBar } from '@/components/complaints/ComplaintFilters';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Map, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ComplaintFilters>({
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    searchQuery: '',
    sortBy: 'newest',
  });

  const loadData = async () => {
    setLoading(true);
    const data = await complaintRepository.getAllComplaints(filters);
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, [filters]);

  const handleUpvote = async (id: string) => {
    await complaintRepository.upvoteComplaint(id, 'user-001');
    loadData();
  };

  const isFiltered =
    filters.category !== 'ALL' ||
    filters.severity !== 'ALL' ||
    filters.status !== 'ALL' ||
    Boolean(filters.searchQuery);

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f5f3ee', flex: 1, pb: { xs: 28, md: 36 } }}>
      <Container maxWidth={false} className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #e2e0d8', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } }}>
              Civic Incident Catalog
            </Typography>
            <Typography variant="body2" sx={{ color: '#52525b' }}>
              Editorial issue feed of reported infrastructure & environmental defects.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/map">
              <Button variant="outlined" size="small" startIcon={<Map className="w-4 h-4" />}>
                Geospatial Map
              </Button>
            </Link>
            <Link href="/report">
              <Button variant="contained" size="small" startIcon={<Plus className="w-4 h-4 stroke-[3]" />}>
                Report Issue
              </Button>
            </Link>
          </Box>
        </Box>

        {/* Filter Bar */}
        <Box sx={{ mb: 4 }}>
          <ComplaintFiltersBar
            filters={filters}
            onChange={(newFilters) => setFilters(newFilters)}
            onReset={() =>
              setFilters({
                category: 'ALL',
                severity: 'ALL',
                status: 'ALL',
                searchQuery: '',
                sortBy: 'newest',
              })
            }
          />
        </Box>

        {/* List Content */}
        {loading ? (
          <LoadingState message="Loading catalog..." height="h-96" />
        ) : complaints.length === 0 ? (
          <EmptyState
            title={isFiltered ? 'No complaints match filters' : 'No civic complaints reported yet'}
            description={
              isFiltered
                ? 'Adjust search or category criteria.'
                : 'The database contains zero reported issues. Be the first citizen to report an incident in your ward.'
            }
            actionLabel={isFiltered ? 'Reset Filters' : 'Report First Issue'}
            onAction={() => {
              if (isFiltered) {
                setFilters({
                  category: 'ALL',
                  severity: 'ALL',
                  status: 'ALL',
                  searchQuery: '',
                  sortBy: 'newest',
                });
              } else {
                router.push('/report');
              }
            }}
          />
        ) : (
          <Grid container spacing={3}>
            {complaints.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <ComplaintCard
                  complaint={item}
                  onUpvote={handleUpvote}
                  isUpvoted={item.upvotedByUserIds?.includes('user-001')}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
