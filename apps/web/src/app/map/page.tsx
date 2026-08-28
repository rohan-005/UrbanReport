'use client';

import React, { useEffect, useState } from 'react';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintFilters, Category, Severity, ComplaintStatus } from '@/lib/types';
import { MapView } from '@/components/map/MapView';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  Filter, 
  Search, 
  MapPin, 
  ArrowRight, 
  Layers, 
  List, 
  X,
  PlusCircle,
  ThumbsUp
} from 'lucide-react';
import Link from 'next/link';

const categories: (Category | 'ALL')[] = [
  'ALL',
  'Pothole',
  'Garbage',
  'Streetlight',
  'Drainage',
  'Road Damage',
  'Water Supply',
  'Traffic',
  'Other',
];

const severities: (Severity | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const statuses: (ComplaintStatus | 'ALL')[] = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REOPENED',
];

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [filters, setFilters] = useState<ComplaintFilters>({
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    searchQuery: '',
  });

  const loadData = async () => {
    setLoading(true);
    const data = await complaintRepository.getAllComplaints(filters);
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [filters]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Header bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
              Live Civic Issue Map
            </h1>
            <p className="text-xs text-slate-400">
              Showing <span className="text-sky-400 font-semibold">{complaints.length}</span> active civic reports across municipality
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/report">
            <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Report Issue
            </Button>
          </Link>
          <Link href="/complaints">
            <Button size="sm" variant="outline" leftIcon={<List className="w-4 h-4" />}>
              List View
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Map Body */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-80 bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 z-20 max-h-[35vh] md:max-h-full">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search address, ID, description..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    filters.category === cat
                      ? 'bg-sky-600 text-white border-sky-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Severity
            </label>
            <div className="flex flex-wrap gap-1.5">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilters({ ...filters, severity: sev })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    filters.severity === sev
                      ? 'bg-amber-600 text-white border-amber-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Status Lifecycle
            </label>
            <select
              value={filters.status || 'ALL'}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as ComplaintStatus | 'ALL' })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Lifecycle Statuses' : st.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Stats list item */}
          <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Matching Reports:</span>
              <span className="font-semibold text-slate-200">{complaints.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Critical Incidents:</span>
              <span className="font-semibold text-rose-400">
                {complaints.filter((c) => c.severity === 'CRITICAL').length}
              </span>
            </div>
          </div>
        </aside>

        {/* Map View Canvas Container */}
        <main className="flex-1 relative h-full">
          {loading ? (
            <LoadingState message="Initializing geospatial map..." height="h-full" />
          ) : (
            <MapView
              complaints={complaints}
              selectedComplaintId={selectedComplaint?.id}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              className="w-full h-full border-none rounded-none"
            />
          )}

          {/* Selected Complaint Detail Drawer Card */}
          {selectedComplaint && (
            <div className="absolute bottom-6 right-6 left-6 md:left-auto md:w-96 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={selectedComplaint.category} size="sm" />
                  <SeverityBadge severity={selectedComplaint.severity} size="sm" />
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-100 line-clamp-1 mb-1">
                {selectedComplaint.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono mb-2">{selectedComplaint.id}</p>

              <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                {selectedComplaint.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="line-clamp-1">{selectedComplaint.address}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <StatusBadge status={selectedComplaint.status} size="sm" />
                <Link href={`/complaints/${selectedComplaint.id}`}>
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open Report
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
