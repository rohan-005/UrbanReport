'use client';

import React, { useEffect, useState } from 'react';
import { authRepository } from '@/lib/repositories/auth.repository';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { User, Complaint } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Bell, 
  PlusCircle, 
  LogOut,
  MapPin,
  ArrowRight,
  ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'complaints' | 'notifications' | 'settings'>('complaints');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [criticalWardBroadcasts, setCriticalWardBroadcasts] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const currentUser = await authRepository.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const all = await complaintRepository.getAllComplaints();
      const userReports = all.filter((c) => c.reporter.id === currentUser.id || c.reporter.name === currentUser.name);
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
      <div className="mx-auto max-w-5xl px-4 py-12">
        <LoadingState message="Loading citizen dashboard profile..." height="h-96" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-100">No Citizen Session Active</h2>
        <p className="text-sm text-slate-400">Please sign in to view your reports dashboard.</p>
        <Link href="/login">
          <Button variant="primary">Sign In Now</Button>
        </Link>
      </div>
    );
  }

  const activeReportsCount = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  ).length;
  const resolvedReportsCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const totalUpvotesReceived = complaints.reduce((acc, c) => acc + c.upvotesCount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Profile Header Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-sky-500/20 overflow-hidden border-2 border-sky-400/40">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{user.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Citizen
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {user.phone}
                </span>
                {user.aadhaarNumber && (
                  <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-sky-400 border border-slate-700">
                    Aadhaar: {user.aadhaarNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/report">
              <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Report New Issue
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
            <FileText className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-100">{complaints.length}</p>
          <span className="text-[11px] text-slate-400">Civic complaints filed by user</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active In Progress</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400">{activeReportsCount}</p>
          <span className="text-[11px] text-slate-400">Currently under municipal work</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Issues</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{resolvedReportsCount}</p>
          <span className="text-[11px] text-slate-400">Successfully verified and closed</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Community Upvotes</span>
            <ThumbsUp className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-sky-400">{totalUpvotesReceived}</p>
          <span className="text-[11px] text-slate-400">Support from fellow citizens</span>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'complaints'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            My Submitted Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'notifications'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Notification Preferences
          </button>
        </div>

        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
                You haven&apos;t submitted any complaints yet.
              </div>
            ) : (
              complaints.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={item.category} size="sm" />
                      <SeverityBadge severity={item.severity} size="sm" />
                      <span className="text-xs font-mono text-slate-400">{item.id}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-100">{item.title}</h4>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="line-clamp-1">{item.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <StatusBadge status={item.status} size="md" />
                    <Link href={`/complaints/${item.id}`}>
                      <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 max-w-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-400" />
              <span>Civic Notification Channels</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h4 className="font-semibold text-slate-200">Email Status Alerts</h4>
                  <p className="text-xs text-slate-400">Receive email when municipal team updates status</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-sky-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h4 className="font-semibold text-slate-200">SMS Resolution Updates</h4>
                  <p className="text-xs text-slate-400 font-sans">Receive instant SMS on field officer dispatch</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-5 h-5 accent-sky-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h4 className="font-semibold text-slate-200">Critical Ward Safety Broadcasts</h4>
                  <p className="text-xs text-slate-400">Emergency alerts for severe water leaks or road cave-ins in ward</p>
                </div>
                <input
                  type="checkbox"
                  checked={criticalWardBroadcasts}
                  onChange={(e) => setCriticalWardBroadcasts(e.target.checked)}
                  className="w-5 h-5 accent-sky-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
