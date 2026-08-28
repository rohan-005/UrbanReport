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
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  RotateCcw,
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
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <LoadingState message="Opening admin control desk..." height="h-96" />
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <ErrorState title="Record Not Found" message={`ID ${complaintId} not found.`} />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6, backgroundColor: '#09090b', flex: 1, pb: 12 }}>
      <Container maxWidth="lg">
        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #27272a' }}>
          <Link href="/admin/complaints" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Resolution Queue</span>
          </Link>

          <Box sx={{ display: 'flex', itemsCenter: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '2px', backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: '0.75rem', fontFamily: 'monospace', color: '#f8fafc' }}>
            <ShieldCheck className="w-4 h-4 text-zinc-100" />
            <span>ADMIN SESSION (VIKRAMADITYA SINGH)</span>
          </Box>
        </Box>

        {/* Dossier Overview */}
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px', mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CategoryBadge category={complaint.category} size="medium" />
              <SeverityBadge severity={complaint.severity} size="medium" />
              <Typography variant="caption" sx={{ color: '#71717a', fontFamily: 'monospace', px: 1, py: 0.25, backgroundColor: '#09090b', border: '1px solid #27272a' }}>
                {complaint.id}
              </Typography>
            </Box>
            <StatusBadge status={complaint.status} size="medium" />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc', mb: 1 }}>
            {complaint.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#a1a1aa', fontSize: '0.875rem' }}>
            <MapPin className="w-4 h-4 text-zinc-100" />
            <span>{complaint.address}</span>
          </Box>
        </Paper>

        {/* Action Controls Bar */}
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px', mb: 4 }}>
          <Typography variant="overline" sx={{ color: '#a1a1aa', fontWeight: 800, mb: 2, display: 'block' }}>
            Status Lifecycle Dispatch Actions
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={actionLoading}
              onClick={() => handleUpdateStatus('VERIFIED', 'Verified by Admin Desk inspection')}
              startIcon={<Eye className="w-4 h-4" />}
            >
              Verify Issue
            </Button>

            <Button
              variant="outlined"
              size="small"
              disabled={actionLoading}
              onClick={() => handleUpdateStatus('IN_PROGRESS', 'Field repair crew deployed')}
              startIcon={<Wrench className="w-4 h-4" />}
            >
              Start Work
            </Button>

            <Button
              variant="contained"
              size="small"
              disabled={actionLoading}
              onClick={() => setIsResolveModalOpen(true)}
              startIcon={<CheckCircle2 className="w-4 h-4" />}
              sx={{ backgroundColor: '#f8fafc', color: '#09090b', fontWeight: 900 }}
            >
              Resolve Complaint
            </Button>

            <Button
              variant="outlined"
              size="small"
              disabled={actionLoading}
              onClick={() => handleUpdateStatus('REOPENED', 'Reopened for inspection')}
              startIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reopen
            </Button>

            <Button
              variant="outlined"
              size="small"
              color="error"
              disabled={actionLoading}
              onClick={() => setIsRejectModalOpen(true)}
              startIcon={<XCircle className="w-4 h-4" />}
            >
              Reject / Close
            </Button>
          </Box>
        </Paper>

        {/* Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <AssignmentPanel
              currentAssignment={complaint.assignment}
              onAssign={handleAssignment}
              isLoading={actionLoading}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', mb: 3 }}>
                Activity & Dispatch Log
              </Typography>
              <ComplaintTimeline timeline={complaint.timeline} />
            </Paper>
          </Grid>
        </Grid>

        {/* Resolve Modal */}
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Resolve Civic Complaint"
        >
          <Box sx={{ spaceY: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
              Enter resolution verification notes for citizen timeline.
            </Typography>

            <TextField
              label="Resolution Verification Notes"
              multiline
              rows={3}
              fullWidth
              value={resolutionNotesInput}
              onChange={(e) => setResolutionNotesInput(e.target.value)}
            />

            <Box sx={{ display: 'flex', justifyEnd: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button variant="outlined" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={actionLoading}
                onClick={() =>
                  handleUpdateStatus(
                    'RESOLVED',
                    resolutionNotesInput.trim() || 'Work verified and completed by department.'
                  )
                }
              >
                Confirm Resolution
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Reject Civic Complaint"
        >
          <Box sx={{ spaceY: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
              Specify the reason for closing or rejecting this entry.
            </Typography>

            <TextField
              label="Rejection Reason"
              multiline
              rows={3}
              fullWidth
              value={rejectionNotesInput}
              onChange={(e) => setRejectionNotesInput(e.target.value)}
            />

            <Box sx={{ display: 'flex', justifyEnd: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button variant="outlined" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={actionLoading}
                onClick={() =>
                  handleUpdateStatus(
                    'REJECTED',
                    rejectionNotesInput.trim() || 'Closed due to invalid or duplicate submission.'
                  )
                }
              >
                Confirm Rejection
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}
