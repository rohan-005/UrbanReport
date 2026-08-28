'use client';

import React, { useEffect, useState } from 'react';
import { authRepository } from '@/lib/repositories/auth.repository';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { User, Complaint } from '@/lib/types';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { LogOut, Plus, MapPin, ArrowRight, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'complaints' | 'notifications'>('complaints');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const currentUser = await authRepository.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const all = await complaintRepository.getAllComplaints();
      const userReports = all.filter(
        (c) => c.reporter.id === currentUser.id || c.reporter.name === currentUser.name
      );
      setComplaints(userReports.length > 0 ? userReports : all.slice(0, 5));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = authRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authRepository.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <LoadingState message="Fetching citizen identity card..." height="h-96" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="xs" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', mb: 1 }}>
          No Session Active
        </Typography>
        <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 3 }}>
          Sign in to view your citizen identity profile.
        </Typography>
        <Link href="/login">
          <Button variant="contained">Sign In</Button>
        </Link>
      </Container>
    );
  }

  const activeReportsCount = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  ).length;
  const resolvedReportsCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <Box sx={{ py: 6, backgroundColor: '#09090b', flex: 1, pb: 12 }}>
      <Container maxWidth="lg">
        {/* Profile Identity Card */}
        <Box sx={{ mb: 4 }}>
          <ProfileCard
            user={user}
            submittedCount={complaints.length}
            activeCount={activeReportsCount}
            resolvedCount={resolvedReportsCount}
          />
        </Box>

        {/* Action Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 4, pb: 2, borderBottom: '1px solid #27272a' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                activeTab === 'complaints'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              My Reported Dossiers ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Notifications
            </button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Link href="/report">
              <Button variant="contained" size="small" startIcon={<Plus className="w-4 h-4 stroke-[3]" />}>
                Report Issue
              </Button>
            </Link>
            <Button variant="outlined" size="small" onClick={handleLogout} startIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </Box>
        </Box>

        {/* Tab Content */}
        {activeTab === 'complaints' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {complaints.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  backgroundColor: '#121215',
                  borderColor: '#27272a',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ spaceY: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CategoryBadge category={item.category} size="small" />
                    <SeverityBadge severity={item.severity} size="small" />
                    <Typography variant="caption" sx={{ color: '#71717a', fontFamily: 'monospace' }}>
                      {item.id}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    {item.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#a1a1aa', fontSize: '0.75rem' }}>
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{item.address}</span>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StatusBadge status={item.status} size="small" />
                  <Link href={`/complaints/${item.id}`}>
                    <Button variant="outlined" size="small" endIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Dossier
                    </Button>
                  </Link>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {activeTab === 'notifications' && (
          <Paper elevation={0} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px', maxWidth: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Bell className="w-5 h-5 text-zinc-100" />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                Notification Preferences
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} color="default" />}
                label={<Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600 }}>Email Resolution Alerts</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} color="default" />}
                label={<Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600 }}>SMS Field Dispatch Updates</Typography>}
              />
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
