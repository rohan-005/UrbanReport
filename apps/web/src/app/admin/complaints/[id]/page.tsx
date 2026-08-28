'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintStatus, Assignment } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { AssignmentPanel } from '@/components/admin/AssignmentPanel';
import { MapView } from '@/components/map/MapView';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  RotateCcw,
  Building2,
  FileText,
  Clock,
  Eye
} from 'lucide-react';

export default function AdminComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Note states
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');
  const [rejectionNotesInput, setRejectionNotesInput] = useState('');

  const loadComplaint = async () => {
    setLoading(true);
    const data = await complaintRepository.getComplaintById(complaintId);
    setComplaint(data);
    setLoading(false);
  };

  useEffect(() => {
    loadComplaint();
    const unsubscribe = complaintRepository.subscribe(() => loadComplaint());
    return () => unsubscribe();
  }, [complaintId]);

  const handleUpdateStatus = async (
    newStatus: ComplaintStatus,
    notes?: string
  ) => {
    if (!complaint) return;
    setActionLoading(true);
    await complaintRepository.updateStatus(
      complaint.id,
      newStatus,
      'Vikramaditya Singh',
      'ADMIN',
      notes
    );
    setActionLoading(false);
    setIsResolveModalOpen(false);
    setIsRejectModalOpen(false);
  };

  const handleAssignment = async (assignment: Assignment) => {
    if (!complaint) return;
    setActionLoading(true);
    await complaintRepository.assignDepartment(
      complaint.id,
      assignment,
      'Vikramaditya Singh'
    );
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <LoadingState message="Fetching administrative control record..." height="h-96" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <ErrorState
          title="Complaint Record Not Found"
          message={`No administrative record matching ID ${complaintId}.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Resolution Queue</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-800/50">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Admin Session Active (Vikramaditya Singh)</span>
        </div>
      </div>

      {/* Dossier Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={complaint.category} size="md" />
            <SeverityBadge severity={complaint.severity} size="md" />
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
              {complaint.id}
            </span>
          </div>
          <StatusBadge status={complaint.status} size="lg" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-100">{complaint.title}</h1>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{complaint.address}</span>
        </div>
      </div>

      {/* Status Action Transition Controls Panel */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Status Lifecycle Actions (Mock Controls)
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* Verify */}
          <Button
            variant="secondary"
            size="sm"
            isLoading={actionLoading}
            onClick={() => handleUpdateStatus('VERIFIED', 'Verified by Admin Desk inspection')}
            leftIcon={<Eye className="w-4 h-4 text-emerald-400" />}
          >
            Mark Verified
          </Button>

          {/* Start Work */}
          <Button
            variant="secondary"
            size="sm"
            isLoading={actionLoading}
            onClick={() => handleUpdateStatus('IN_PROGRESS', 'Field crew deployed on location')}
            leftIcon={<Wrench className="w-4 h-4 text-cyan-400" />}
          >
            Start Work (In Progress)
          </Button>

          {/* Resolve */}
          <Button
            variant="success"
            size="sm"
            isLoading={actionLoading}
            onClick={() => setIsResolveModalOpen(true)}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Resolve Complaint
          </Button>

          {/* Reopen */}
          <Button
            variant="outline"
            size="sm"
            isLoading={actionLoading}
            onClick={() => handleUpdateStatus('REOPENED', 'Reopened for inspection')}
            leftIcon={<RotateCcw className="w-4 h-4 text-orange-400" />}
          >
            Reopen Complaint
          </Button>

          {/* Reject */}
          <Button
            variant="danger"
            size="sm"
            isLoading={actionLoading}
            onClick={() => setIsRejectModalOpen(true)}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Reject / Close
          </Button>
        </div>
      </div>

      {/* Grid: Assignment & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assignment Panel & Details */}
        <div className="lg:col-span-1 space-y-6">
          <AssignmentPanel
            currentAssignment={complaint.assignment}
            onAssign={handleAssignment}
            isLoading={actionLoading}
          />

          {/* Reporter info */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">Citizen Reporter Info</h4>
            <div className="text-slate-400 flex justify-between">
              <span>Name:</span>
              <span className="text-slate-200 font-semibold">{complaint.reporter.name}</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Reporter ID:</span>
              <span className="font-mono text-sky-400">{complaint.reporter.id}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" />
              <span>Full Activity & Dispatch Timeline</span>
            </h3>

            <ComplaintTimeline timeline={complaint.timeline} />
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Civic Complaint"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Please enter resolution verification notes to confirm work completion for the citizen.
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Hot mix asphalt patch applied, rolled, and leveled. Road cleared for traffic."
            value={resolutionNotesInput}
            onChange={(e) => setResolutionNotesInput(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              isLoading={actionLoading}
              onClick={() =>
                handleUpdateStatus(
                  'RESOLVED',
                  resolutionNotesInput.trim() || 'Work verified and completed by department.'
                )
              }
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Civic Complaint"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Specify the reason for rejecting or closing this complaint entry (e.g. duplicate report).
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Closed as duplicate report under active maintenance contract #PRK-88."
            value={rejectionNotesInput}
            onChange={(e) => setRejectionNotesInput(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={actionLoading}
              onClick={() =>
                handleUpdateStatus(
                  'REJECTED',
                  rejectionNotesInput.trim() || 'Closed due to invalid or duplicate submission.'
                )
              }
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
