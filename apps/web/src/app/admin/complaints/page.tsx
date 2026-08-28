'use client';

import React, { useEffect, useState } from 'react';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintFilters, Category, Severity, ComplaintStatus } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminComplaintTable } from '@/components/admin/AdminComplaintTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ComplaintFilters>({
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    searchQuery: '',
    sortBy: 'severity',
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      <PageHeader
        title="Admin Resolution Queue"
        description="Filter, inspect, and transition status for all municipal civic reports across city sectors."
        action={
          <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        }
      />

      {/* Admin Filters */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ID, title, address..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <select
              value={filters.severity || 'ALL'}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value as Severity | 'ALL' })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
          </div>

          <div>
            <select
              value={filters.status || 'ALL'}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as ComplaintStatus | 'ALL' })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPENED">Reopened</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={filters.sortBy || 'severity'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as 'newest' | 'oldest' | 'upvotes' | 'severity',
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="severity">Sort: Highest Severity</option>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="upvotes">Sort: Most Upvoted</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Filtering administrative records..." height="h-96" />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No admin queue items found"
          description="No complaints match the specified filter criteria."
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
    </div>
  );
}
