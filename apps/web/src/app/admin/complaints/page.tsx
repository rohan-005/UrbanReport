'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintFilters, Severity, ComplaintStatus } from '@/lib/types';
import { AdminComplaintTable } from '@/components/admin/AdminComplaintTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageTransition } from '@/components/motion/PageTransition';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import { Search, RefreshCw } from 'lucide-react';

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ComplaintFilters>({
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    searchQuery: '',
    sortBy: 'severity',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'OFFICER' && user?.role !== 'AUTHORITY')) {
        router.push('/admin/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    setLoading(true);
    const data = await complaintRepository.getAllComplaints({ ...filters, includeRejected: true });
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, [filters]);

  return (
    <PageTransition>
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f5f3ee', flex: 1, pb: { xs: 28, md: 36 } }}>
        <Container maxWidth={false} className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #e2dfd7', gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 0.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                Admin Resolution Queue
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Multi-criteria filter and dispatch control table.
              </Typography>
            </Box>

            <Button variant="outlined" size="small" onClick={loadData} startIcon={<RefreshCw className="w-3.5 h-3.5 text-[#877b5f]" />}>
              Refresh
            </Button>
          </Box>

          {/* Filter Controls */}
          <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search ID, title, address..."
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="w-4 h-4 text-[#877b5f]" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                size="small"
                value={filters.severity || 'ALL'}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value as Severity | 'ALL' })}
              >
                <MenuItem value="ALL">All Severities</MenuItem>
                <MenuItem value="CRITICAL">Critical Only</MenuItem>
                <MenuItem value="HIGH">High Only</MenuItem>
                <MenuItem value="MEDIUM">Medium Only</MenuItem>
                <MenuItem value="LOW">Low Only</MenuItem>
              </TextField>

              <TextField
                select
                size="small"
                value={filters.status || 'ALL'}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as ComplaintStatus | 'ALL' })
                }
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="SUBMITTED">Submitted</MenuItem>
                <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
                <MenuItem value="REOPENED">Reopened</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>

              <TextField
                select
                size="small"
                value={filters.sortBy || 'severity'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as 'newest' | 'oldest' | 'upvotes' | 'severity',
                  })
                }
              >
                <MenuItem value="severity">Sort: Highest Severity</MenuItem>
                <MenuItem value="newest">Sort: Newest</MenuItem>
                <MenuItem value="oldest">Sort: Oldest</MenuItem>
                <MenuItem value="upvotes">Sort: Upvotes</MenuItem>
              </TextField>
            </Box>
          </Paper>


          {loading ? (
            <LoadingState message="Filtering administrative records..." height="h-96" />
          ) : complaints.length === 0 ? (
            <EmptyState
              title="No admin queue records found"
              description="Adjust search parameters or clear filters."
              actionLabel="Reset Queue Filters"
              onAction={() =>
                setFilters({
                  category: 'ALL',
                  severity: 'ALL',
                  status: 'ALL',
                  searchQuery: '',
                  sortBy: 'severity',
                })
              }
            />
          ) : (
            <AdminComplaintTable complaints={complaints} />
          )}
        </Container>
      </Box>
    </PageTransition>
  );
}
