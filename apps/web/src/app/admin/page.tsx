'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint } from '@/lib/types';
import { StatsCards } from '@/components/admin/StatsCards';
import { AdminComplaintTable } from '@/components/admin/AdminComplaintTable';
import { LoadingState } from '@/components/ui/LoadingState';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ShieldCheck, ListFilter, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await complaintRepository.getAllComplaints();
    const statsData = await complaintRepository.getStats();
    setComplaints(data);
    setStats(statsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  const criticalComplaints = complaints.filter((c) => c.severity === 'CRITICAL');

  return (
    <Box sx={{ py: 6, backgroundColor: '#09090b', flex: 1, pb: 12 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #27272a', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#f8fafc', mb: 0.5 }}>
              Municipal Operations Desk
            </Typography>
            <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
              Real-time triage, departmental assignment, and resolution verification control.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" size="small" onClick={loadData} startIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
            <Link href="/admin/complaints">
              <Button variant="contained" size="small" startIcon={<ListFilter className="w-3.5 h-3.5" />}>
                Resolution Queue
              </Button>
            </Link>
          </Box>
        </Box>

        {loading || !stats ? (
          <LoadingState message="Loading telemetry..." height="h-64" />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <StatsCards stats={stats} />

            {criticalComplaints.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: '#450a0a',
                  borderColor: '#991b1b',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse shrink-0" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fca5a5' }}>
                      {criticalComplaints.length} Critical Hazard Alert(s) Requiring Immediate Dispatch
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#fca5a5' }}>
                      Emergency issues flagged with direct danger to human life or infrastructure.
                    </Typography>
                  </Box>
                </Box>
                <Link href="/admin/complaints?severity=CRITICAL">
                  <Button variant="contained" size="small" sx={{ backgroundColor: '#dc2626', color: '#ffffff', '&:hover': { backgroundColor: '#b91c1c' } }}>
                    Triage Critical
                  </Button>
                </Link>
              </Paper>
            )}

            <Box sx={{ spaceY: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldCheck className="w-5 h-5 text-zinc-100" />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    Recent Incident Queue ({complaints.length})
                  </Typography>
                </Box>
                <Link href="/admin/complaints" className="text-xs font-bold uppercase tracking-wider text-zinc-100 hover:underline">
                  Full Queue →
                </Link>
              </Box>

              <AdminComplaintTable complaints={complaints.slice(0, 8)} />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
