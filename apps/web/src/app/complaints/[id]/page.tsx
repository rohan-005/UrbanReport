'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { MapView } from '@/components/map/MapView';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  ThumbsUp, 
  ShieldCheck, 
  Clock, 
  FileText,
  Image as ImageIcon,
  Building2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);

  const loadComplaint = async () => {
    setLoading(true);
    const data = await complaintRepository.getComplaintById(complaintId);
    setComplaint(data);
    if (data) {
      setIsUpvoted(data.upvotedByUserIds?.includes('user-001') || false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComplaint();
    const unsubscribe = complaintRepository.subscribe(() => {
      loadComplaint();
    });
    return () => unsubscribe();
  }, [complaintId]);

  const handleUpvote = async () => {
    if (!complaint) return;
    const updated = await complaintRepository.upvoteComplaint(complaint.id, 'user-001');
    if (updated) {
      setComplaint(updated);
      setIsUpvoted(updated.upvotedByUserIds?.includes('user-001') || false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <LoadingState message="Fetching civic issue dossier..." height="h-96" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <ErrorState
          title="Complaint Not Found"
          message={`No civic report found with ID ${complaintId}. It may have been archived or removed.`}
        />
        <div className="text-center mt-6">
          <Link href="/complaints">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Complaints Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedCreated = new Date(complaint.createdAt).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
              isUpvoted
                ? 'bg-sky-600/20 text-sky-400 border-sky-500/50'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-sky-400 text-sky-400' : ''}`} />
            <span>{complaint.upvotesCount} Upvotes</span>
          </button>

          <Link href={`/admin/complaints/${complaint.id}`}>
            <Button variant="outline" size="md" leftIcon={<ShieldCheck className="w-4 h-4 text-purple-400" />}>
              Admin Review Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Dossier Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={complaint.category} size="md" />
            <SeverityBadge severity={complaint.severity} size="md" />
          </div>
          <StatusBadge status={complaint.status} size="lg" />
        </div>

        <div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-2">
            <span className="bg-slate-800 text-sky-400 px-2.5 py-1 rounded-md border border-slate-700 font-bold">
              {complaint.id}
            </span>
            <span>Reported on {formattedCreated}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
            {complaint.title}
          </h1>
        </div>

        {/* Location & Address */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-200">
          <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300 block text-xs uppercase tracking-wider mb-0.5">
              Incident Location Address
            </span>
            <span>{complaint.address}</span>
            <span className="block text-xs font-mono text-slate-400 mt-1">
              GPS Coordinates: {complaint.latitude.toFixed(4)}° N, {complaint.longitude.toFixed(4)}° E
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Problem Description
          </h3>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            {complaint.description}
          </p>
        </div>
      </div>

      {/* Grid: Left Timeline & Assignment - Right Map & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timeline & Assignment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Assignment Information Card */}
          {complaint.assignment && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-100">Municipal Assignment Desk</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block font-medium">Department</span>
                  <span className="font-semibold text-purple-300">{complaint.assignment.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block font-medium">Assigned Field Officer</span>
                  <span className="font-semibold text-slate-200">
                    {complaint.assignment.assignedOfficer || 'Unassigned'}
                  </span>
                </div>
              </div>

              {complaint.assignment.notes && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-slate-300">
                  <span className="font-bold text-purple-400">Department Notes: </span>
                  {complaint.assignment.notes}
                </div>
              )}
            </div>
          )}

          {/* Resolution Notes if Resolved/Rejected */}
          {complaint.resolutionNotes && (
            <div className="rounded-2xl bg-emerald-950/30 border border-emerald-800/50 p-6 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Resolution Officer Verification Remarks</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-mono p-3 rounded-xl bg-slate-900/80 border border-emerald-900/60">
                {complaint.resolutionNotes}
              </p>
            </div>
          )}

          {/* Visual Activity Timeline */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-slate-100">Lifecycle Progress Timeline</h3>
              </div>
              <span className="text-xs text-slate-400">
                {complaint.timeline.length} Status Events
              </span>
            </div>

            <ComplaintTimeline timeline={complaint.timeline} />
          </div>
        </div>

        {/* Right Column: Interactive Location Map & Media Gallery */}
        <div className="space-y-8">
          {/* Map Location Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Geospatial Pin</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {complaint.latitude.toFixed(3)}, {complaint.longitude.toFixed(3)}
              </span>
            </div>

            <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800">
              <MapView
                complaints={[complaint]}
                selectedComplaintId={complaint.id}
                center={[complaint.longitude, complaint.latitude]}
                zoom={14}
                interactive={true}
              />
            </div>
          </div>

          {/* Evidence Media Gallery */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>Photographic Evidence</span>
              </h3>
              <span className="text-xs text-slate-400">
                {complaint.media.length} Photos
              </span>
            </div>

            <div className="space-y-3">
              {complaint.media.map((item) => (
                <div key={item.id} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={item.url}
                    alt={item.caption || 'Evidence photo'}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {item.caption && (
                    <div className="p-2.5 bg-slate-900 text-xs text-slate-400 border-t border-slate-800 font-mono">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
