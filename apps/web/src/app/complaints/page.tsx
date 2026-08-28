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

export default function ComplaintsPage() {
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

  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f3ee', flex: 1, pb: 16 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #e2e0d8', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5 }}>
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
            title="No complaints match filters"
            description="Adjust search or category criteria."
            actionLabel="Reset Filters"
            onAction={() =>
              setFilters({
                category: 'ALL',
                severity: 'ALL',
                status: 'ALL',
                searchQuery: '',
                sortBy: 'newest',
              })
            }
          />
        ) : (
          <Grid container spacing={3}>
            {complaints.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
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
