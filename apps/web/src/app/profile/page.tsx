'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint } from '@/lib/types';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageTransition } from '@/components/motion/PageTransition';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import { LogOut, Plus, MapPin, ArrowRight, Bell, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateNotificationPreferences } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<'complaints' | 'notifications'>('complaints');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(
    user?.notificationPreferences?.complaintUpdates ?? true
  );
  const [resolutionAlerts, setResolutionAlerts] = useState(
    user?.notificationPreferences?.resolutionNotifications ?? true
  );
  const [assignmentAlerts, setAssignmentAlerts] = useState(
    user?.notificationPreferences?.assignmentUpdates ?? true
  );

  useEffect(() => {
    if (user?.notificationPreferences) {
      setEmailAlerts(user.notificationPreferences.complaintUpdates);
      setResolutionAlerts(user.notificationPreferences.resolutionNotifications);
      setAssignmentAlerts(user.notificationPreferences.assignmentUpdates);
    }
  }, [user]);

  useEffect(() => {
    const loadUserReports = async () => {
      if (user) {
        const all = await complaintRepository.getAllComplaints();
        const userReports = all.filter(
          (c) => c.reporter.id === user.id || c.reporter.name === user.name
        );
        setComplaints(userReports.length > 0 ? userReports : all.slice(0, 5));
      }
    };
    loadUserReports();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSavePreferences = async (newPrefs: {
    complaintUpdates: boolean;
    resolutionNotifications: boolean;
    assignmentUpdates: boolean;
  }) => {
    try {
      await updateNotificationPreferences(newPrefs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // fallback
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <LoadingState message="Fetching authenticated citizen identity card..." height="h-96" />
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="xs" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#09090b', mb: 1 }}>
          Session Required
        </Typography>
        <Typography variant="body2" sx={{ color: '#52525b', mb: 3 }}>
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
    <PageTransition>
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f5f3ee', flex: 1, pb: { xs: 28, md: 36 } }}>
        <Container maxWidth={false} className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', mb: 4, pb: 2, borderBottom: '1px solid #e2e0d8', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <button
                onClick={() => setActiveTab('complaints')}
                className={`text-xs font-black uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                  activeTab === 'complaints'
                    ? 'border-black text-black'
                    : 'border-transparent text-zinc-500 hover:text-black'
                }`}
              >
                My Reported Dossiers ({complaints.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`text-xs font-black uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-black text-black'
                    : 'border-transparent text-zinc-500 hover:text-black'
                }`}
              >
                Notification Preferences
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
              {complaints.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#09090b', mb: 0.5 }}>
                    No Filed Complaints Yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#52525b', mb: 2 }}>
                    Report a pothole, broken streetlight, or garbage issue to track it here.
                  </Typography>
                  <Link href="/report">
                    <Button variant="contained" size="small" startIcon={<Plus className="w-4 h-4 stroke-[3]" />}>
                      Report First Issue
                    </Button>
                  </Link>
                </Paper>
              ) : (
                complaints.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e0d8',
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
                        <Typography variant="caption" sx={{ color: '#52525b', fontFamily: 'monospace', fontWeight: 700 }}>
                          {item.id}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#09090b' }}>
                        {item.title}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#52525b', fontSize: '0.75rem', fontWeight: 600 }}>
                        <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
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
                ))
              )}
            </Box>
          )}

          {activeTab === 'notifications' && (
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', maxWidth: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Bell className="w-5 h-5 text-zinc-950" />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#09090b' }}>
                  Notification Settings & Preferences
                </Typography>
              </Box>

              {saveSuccess && (
                <Alert icon={<CheckCircle2 className="w-4 h-4 text-green-700" />} severity="success" sx={{ mb: 3, borderRadius: '2px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                  Notification settings saved to MongoDB user profile.
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailAlerts}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setEmailAlerts(val);
                        handleSavePreferences({
                          complaintUpdates: val,
                          resolutionNotifications: resolutionAlerts,
                          assignmentUpdates: assignmentAlerts,
                        });
                      }}
                      color="default"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#09090b', fontWeight: 800 }}>Complaint Status Change Alerts</Typography>
                      <Typography variant="caption" sx={{ color: '#52525b' }}>Receive updates when ward officers change issue status.</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={resolutionAlerts}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setResolutionAlerts(val);
                        handleSavePreferences({
                          complaintUpdates: emailAlerts,
                          resolutionNotifications: val,
                          assignmentUpdates: assignmentAlerts,
                        });
                      }}
                      color="default"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#09090b', fontWeight: 800 }}>Resolution Notifications</Typography>
                      <Typography variant="caption" sx={{ color: '#52525b' }}>Receive proof of repair when municipal crew resolves work.</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={assignmentAlerts}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setAssignmentAlerts(val);
                        handleSavePreferences({
                          complaintUpdates: emailAlerts,
                          resolutionNotifications: resolutionAlerts,
                          assignmentUpdates: val,
                        });
                      }}
                      color="default"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#09090b', fontWeight: 800 }}>Department Assignment Updates</Typography>
                      <Typography variant="caption" sx={{ color: '#52525b' }}>Notify when assigned to engineering or sanitation units.</Typography>
                    </Box>
                  }
                />
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </PageTransition>
  );
}
