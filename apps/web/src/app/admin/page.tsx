'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, AnalyticsOverview } from '@/lib/types';
import { StatsCards } from '@/components/admin/StatsCards';
import { AdminComplaintTable } from '@/components/admin/AdminComplaintTable';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageTransition } from '@/components/motion/PageTransition';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ShieldCheck, ListFilter, AlertTriangle, RefreshCw, BarChart2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'OFFICER' && user?.role !== 'AUTHORITY')) {
        router.push('/admin/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    setLoading(true);
    const data = await complaintRepository.getAllComplaints({ includeRejected: true });
    const statsData = await complaintRepository.getStats();
    const analyticsData = await complaintRepository.getAnalyticsOverview();
    setComplaints(data);
    setStats(statsData);
    setAnalytics(analyticsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  const criticalComplaints = complaints.filter((c) => c.severity === 'CRITICAL');

  return (
    <PageTransition>
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f5f3ee', flex: 1, pb: { xs: 28, md: 36 } }}>
        <Container maxWidth={false} className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Header */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #e2dfd7', gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 0.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                Municipal Operations Desk
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Real-time triage, departmental assignment, and resolution verification control.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" size="small" onClick={loadData} startIcon={<RefreshCw className="w-3.5 h-3.5 text-[#877b5f]" />}>
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

              {analytics && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BarChart2 className="w-5 h-5 text-[#877b5f]" />
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                      Platform Analytics & Geospatial Hotspots
                    </Typography>
                  </Box>
                  <AnalyticsDashboard analytics={analytics} />
                </Box>
              )}

              {criticalComplaints.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AlertTriangle className="w-6 h-6 text-rose-700 shrink-0" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#991b1b' }}>
                        {criticalComplaints.length} Critical Hazard Alert(s) Requiring Immediate Dispatch
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                        Emergency issues flagged with direct danger to human life or infrastructure.
                      </Typography>
                    </Box>
                  </Box>
                  <Link href="/admin/complaints?severity=CRITICAL">
                    <Button variant="contained" size="small" sx={{ backgroundColor: '#dc2626', color: '#ffffff', borderRadius: '8px', '&:hover': { backgroundColor: '#b91c1c' } }}>
                      Triage Critical
                    </Button>
                  </Link>
                </Paper>
              )}

              <Box sx={{ spaceY: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldCheck className="w-5 h-5 text-[#877b5f]" />
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                      Recent Incident Queue ({complaints.length})
                    </Typography>
                  </Box>
                  <Link href="/admin/complaints" className="text-xs font-bold uppercase tracking-wider text-[#89a577] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                    Full Queue →
                  </Link>
                </Box>

                <AdminComplaintTable complaints={complaints.slice(0, 8)} />
              </Box>
            </Box>
          )}

        </Container>
      </Box>
    </PageTransition>
  );
}
