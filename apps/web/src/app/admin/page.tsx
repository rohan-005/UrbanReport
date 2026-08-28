'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCards } from '@/components/admin/StatsCards';
import { AdminComplaintTable } from '@/components/admin/AdminComplaintTable';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  ShieldCheck, 
  ListFilter, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

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
  const pendingComplaints = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      <PageHeader
        title="Municipal Admin Overview Desk"
        description="Real-time triage, departmental assignment dispatch, and resolution verification for city-wide civic reports."
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh Queue
            </Button>
            <Link href="/admin/complaints">
              <Button variant="primary" size="sm" leftIcon={<ListFilter className="w-3.5 h-3.5" />}>
                Full Resolution Queue
              </Button>
            </Link>
          </div>
        }
      />

      {loading || !stats ? (
        <LoadingState message="Calculating municipal telemetry..." height="h-64" />
      ) : (
        <>
          {/* Key Metrics */}
          <StatsCards stats={stats} />

          {/* Emergency Alert Banner if Critical Issues Exist */}
          {criticalComplaints.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-900/60 text-rose-400 border border-rose-700/80 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-200">
                    {criticalComplaints.length} Critical Hazard Alert(s) Requiring Urgent Dispatch
                  </h4>
                  <p className="text-xs text-slate-300">
                    High severity issues flagged with direct danger to citizen life/safety.
                  </p>
                </div>
              </div>
              <Link href="/admin/complaints?severity=CRITICAL">
                <Button size="sm" variant="danger">
                  Triage Critical Incidents
                </Button>
              </Link>
            </div>
          )}

          {/* Pending Triage Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Recent Complaint Queue ({complaints.length})</span>
              </h3>
              <Link
                href="/admin/complaints"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>View All Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <AdminComplaintTable complaints={complaints.slice(0, 8)} />
          </div>
        </>
      )}
    </div>
  );
}
