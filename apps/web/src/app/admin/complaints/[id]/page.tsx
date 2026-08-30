'use client';

import React, { useEffect, useState, use, useCallback } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { MediaService } from '@/lib/services/mediaService';
import { Complaint, ComplaintStatus, Assignment, MediaItem } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { AssignmentPanel } from '@/components/admin/AssignmentPanel';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MapView } from '@/components/map/MapView';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  RotateCcw,
  Eye,
  Building2,
  Upload,
  Image as ImageIcon,
  History,
  AlertTriangle
} from 'lucide-react';

const REJECTION_REASONS = [
  'Duplicate report',
  'Insufficient evidence',
  'Invalid location',
  'Not a civic issue',
  'Other',
];

export default function AdminComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);

  // Modals
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  // Form Inputs
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [uploadingResolutionMedia, setUploadingResolutionMedia] = useState(false);
  
  const [rejectionCategory, setRejectionCategory] = useState(REJECTION_REASONS[0]);
  const [rejectionNotesInput, setRejectionNotesInput] = useState('');

  const [reopenNotesInput, setReopenNotesInput] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'OFFICER' && user?.role !== 'AUTHORITY')) {
        router.push('/admin/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadComplaint = useCallback(async () => {
    setLoading(true);
    const data = await complaintRepository.getComplaintById(complaintId);
    setComplaint(data);
    if (data) {
      const audits = await complaintRepository.getAuditEvents(complaintId);
      setAuditEvents(audits);
    }
    setLoading(false);
  }, [complaintId]);

  useEffect(() => {
    loadComplaint();
    const unsubscribe = complaintRepository.subscribe(() => loadComplaint());
    return () => unsubscribe();
  }, [loadComplaint]);

  // State Machine helper
  const getAllowedTransitions = (status: ComplaintStatus): ComplaintStatus[] => {
    switch (status) {
      case 'SUBMITTED':
        return ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'];
      case 'UNDER_REVIEW':
        return ['VERIFIED', 'REJECTED'];
      case 'VERIFIED':
        return ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'];
      case 'ASSIGNED':
        return ['IN_PROGRESS', 'REJECTED'];
      case 'IN_PROGRESS':
        return ['RESOLVED', 'REOPENED'];
      case 'RESOLVED':
        return ['REOPENED'];
      case 'REOPENED':
        return ['UNDER_REVIEW', 'VERIFIED', 'IN_PROGRESS', 'REJECTED'];
      case 'REJECTED':
        return ['REOPENED'];
      default:
        return [];
    }
  };

  const handleUpdateStatus = async (
    newStatus: ComplaintStatus,
    notes?: string,
    resolutionMediaIds?: string[]
  ) => {
    if (!complaint) return;
    setStatusError(null);
    setActionLoading(true);

    try {
      const updated = await complaintRepository.updateStatus(
        complaint.id,
        newStatus,
        user?.name || 'Administrator',
        (user?.role as any) || 'ADMIN',
        notes,
        resolutionMediaIds
      );
      if (updated) {
        setComplaint(updated);
        const emailAddr = updated.reporter?.email || 'rokumar005@gmail.com';
        setNotificationSuccess(`Status updated to ${newStatus}. Automated notification email dispatched to citizen (${emailAddr}).`);
      }
      setIsResolveModalOpen(false);
      setIsRejectModalOpen(false);
      setIsReopenModalOpen(false);
      setResolutionNotesInput('');
      setResolutionFile(null);
      setRejectionNotesInput('');
      setReopenNotesInput('');
      await loadComplaint();
    } catch (err: any) {
      setStatusError(err.message || 'Status transition failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmResolution = async () => {
    if (!complaint) return;
    setActionLoading(true);
    let mediaIds: string[] | undefined = undefined;

    if (resolutionFile) {
      setUploadingResolutionMedia(true);
      try {
        const uploaded = await MediaService.uploadImage(resolutionFile);
        if (uploaded && uploaded.mediaId) {
          mediaIds = [uploaded.mediaId];
        }
      } catch (err: any) {
        setStatusError(`Resolution photo upload failed: ${err.message}`);
        setActionLoading(false);
        setUploadingResolutionMedia(false);
        return;
      }
      setUploadingResolutionMedia(false);
    }

    const noteText = resolutionNotesInput.trim() || 'Resolution work completed and verified by municipal officer.';
    await handleUpdateStatus('RESOLVED', noteText, mediaIds);
  };

  const handleConfirmRejection = async () => {
    const noteText = `[Rejection Reason: ${rejectionCategory}] ${rejectionNotesInput.trim()}`.trim();
    await handleUpdateStatus('REJECTED', noteText);
  };

  const handleConfirmReopen = async () => {
    const noteText = reopenNotesInput.trim() || 'Reopened for inspection and field review.';
    await handleUpdateStatus('REOPENED', noteText);
  };

  const handleAssignment = async (assignment: Assignment) => {
    if (!complaint) return;
    setActionLoading(true);
    try {
      const updated = await complaintRepository.assignDepartment(
        complaint.id,
        assignment,
        user?.name || 'Administrator'
      );
      if (updated) {
        setComplaint(updated);
        const emailAddr = updated.reporter?.email || 'rokumar005@gmail.com';
        setNotificationSuccess(`Assigned to ${assignment.department}. Automated notification email dispatched to citizen (${emailAddr}).`);
      }
      await loadComplaint();
    } catch (err: any) {
      setStatusError(err.message || 'Department assignment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <LoadingState message="Opening municipal admin control desk..." height="h-96" />
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <ErrorState title="Record Not Found" message={`Complaint ID ${complaintId} was not found.`} />
      </Container>
    );
  }

  const allowedNextStates = getAllowedTransitions(complaint.status);
  const beforeMedia = complaint.media || [];
  const afterMedia = complaint.resolutionMedia || [];

  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f3ee', flex: 1, pb: 36 }}>
      <Container maxWidth="lg">
        {/* Top Bar Navigation */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #e2dfd7', gap: 2 }}>
          <Link href="/admin/complaints" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#877b5f] hover:text-[#1f241d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
            <ArrowLeft className="w-4 h-4 text-[#877b5f]" />
            <span>Return to Resolution Queue</span>
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '9999px', backgroundColor: '#1f241d', color: '#ffffff', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            <ShieldCheck className="w-4 h-4 text-[#a8c38e]" />
            <span>SESSION: {user?.name?.toUpperCase() || 'ADMINISTRATOR'} ({user?.role})</span>
          </Box>
        </Box>

        {statusError && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '8px', fontWeight: 600 }}>
            {statusError}
          </Alert>
        )}

        {notificationSuccess && (
          <Alert
            severity="success"
            onClose={() => setNotificationSuccess(null)}
            sx={{ mb: 4, borderRadius: '8px', fontWeight: 700 }}
          >
            {notificationSuccess}
          </Alert>
        )}

        {/* Dossier Header */}
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryBadge category={complaint.category} size="medium" />
              <SeverityBadge severity={complaint.severity} size="medium" />
              <Typography variant="caption" sx={{ color: '#1f241d', fontFamily: 'monospace', px: 1, py: 0.25, backgroundColor: '#f5f3ee', border: '1px solid #e2dfd7', fontWeight: 700, borderRadius: '4px' }}>
                {complaint.id}
              </Typography>
            </Box>
            <StatusBadge status={complaint.status} size="medium" />
          </Box>

          <Typography variant="h4" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 1, fontSize: { xs: '1.5rem', md: '2.25rem' } }}>
            {complaint.title}
          </Typography>

          <Typography variant="body1" sx={{ color: '#6b7280', mb: 3, leading: 'relaxed' }}>
            {complaint.description}
          </Typography>

          <Grid container spacing={2} sx={{ pt: 2, borderTop: '1px solid #e2dfd7' }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ color: '#877b5f', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Address / Location</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#1f241d', fontWeight: 700, fontSize: '0.875rem' }}>
                <MapPin className="w-4 h-4 text-[#877b5f] shrink-0" />
                <span className="truncate">{complaint.address}</span>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ color: '#877b5f', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Citizen Reporter</Typography>
              <Typography variant="body2" sx={{ color: '#1f241d', fontWeight: 700 }}>
                {complaint.reporter?.name || 'Citizen User'} ({complaint.reporter?.id || 'ID N/A'})
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ color: '#877b5f', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Reported Date</Typography>
              <Typography variant="body2" sx={{ color: '#1f241d', fontWeight: 700 }}>
                {new Date(complaint.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ color: '#877b5f', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Assigned Department</Typography>
              <Typography variant="body2" sx={{ color: '#1f241d', fontWeight: 700 }}>
                {complaint.assignment?.department || 'Unassigned'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ color: '#877b5f', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Community Confirmations</Typography>
              <Typography variant="body2" sx={{ color: '#4e6d3c', fontWeight: 700 }}>
                {complaint.confirmationsCount || complaint.upvotesCount || 0} Citizens Confirmed
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Controlled Lifecycle Actions Bar */}
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
          <Typography variant="overline" sx={{ color: '#877b5f', fontWeight: 700, mb: 1.5, display: 'block' }}>
            Current Status: <span className="font-mono text-[#1f241d]">{complaint.status}</span> — Authorized Transition Actions
          </Typography>

          {allowedNextStates.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: '8px' }}>
              No further state transitions allowed from <strong>{complaint.status}</strong>.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {allowedNextStates.includes('UNDER_REVIEW') && (
                <Button
                  variant="outlined"
                  size="small"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('UNDER_REVIEW', 'Review started by admin desk')}
                  startIcon={<Eye className="w-4 h-4" />}
                  sx={{ borderRadius: '8px' }}
                >
                  Start Review
                </Button>
              )}

              {allowedNextStates.includes('VERIFIED') && (
                <Button
                  variant="outlined"
                  size="small"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('VERIFIED', 'Verified by Admin Desk inspection')}
                  startIcon={<ShieldCheck className="w-4 h-4 text-[#89a577]" />}
                  sx={{ borderRadius: '8px' }}
                >
                  Verify Complaint
                </Button>
              )}

              {allowedNextStates.includes('IN_PROGRESS') && (
                <Button
                  variant="outlined"
                  size="small"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('IN_PROGRESS', 'Field repair crew deployed')}
                  startIcon={<Wrench className="w-4 h-4 text-[#877b5f]" />}
                  sx={{ borderRadius: '8px' }}
                >
                  Mark In Progress
                </Button>
              )}

              {allowedNextStates.includes('RESOLVED') && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={actionLoading}
                  onClick={() => setIsResolveModalOpen(true)}
                  startIcon={<CheckCircle2 className="w-4 h-4" />}
                  sx={{ backgroundColor: '#89a577', color: '#ffffff', fontWeight: 700, borderRadius: '8px', '&:hover': { backgroundColor: '#6e895d' } }}
                >
                  Resolve & Complete
                </Button>
              )}

              {allowedNextStates.includes('REOPENED') && (
                <Button
                  variant="outlined"
                  size="small"
                  disabled={actionLoading}
                  onClick={() => setIsReopenModalOpen(true)}
                  startIcon={<RotateCcw className="w-4 h-4" />}
                  sx={{ borderRadius: '8px' }}
                >
                  Reopen Complaint
                </Button>
              )}

              {allowedNextStates.includes('REJECTED') && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  disabled={actionLoading}
                  onClick={() => setIsRejectModalOpen(true)}
                  startIcon={<XCircle className="w-4 h-4" />}
                  sx={{ borderRadius: '8px' }}
                >
                  Reject Complaint
                </Button>
              )}
            </Box>
          )}
        </Paper>

        {/* Before / After Evidence Visual Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon className="w-5 h-5 text-[#877b5f]" />
            <span>Complaint Evidence Verification (Before & After)</span>
          </Typography>

          <Grid container spacing={3}>
            {/* BEFORE EVIDENCE */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                    BEFORE (Citizen Submission)
                  </Typography>
                  <Chip label={`${beforeMedia.length} Photo(s)`} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: '9999px' }} />
                </Box>

                {beforeMedia.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f3ee', borderRadius: '8px', border: '1px dashed #e2dfd7' }}>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>No initial photos uploaded by citizen.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
                    {beforeMedia.map((m) => (
                      <Box key={m.id} sx={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2dfd7' }}>
                        <img src={m.url} alt={m.caption || 'Before photo'} className="w-full h-36 object-cover" />
                        <Typography variant="caption" sx={{ p: 1, display: 'block', backgroundColor: '#f5f3ee', color: '#6b7280', fontSize: '0.6875rem' }}>
                          {m.caption || 'Initial evidence photo'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* AFTER EVIDENCE */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                    AFTER (Resolution Verification)
                  </Typography>
                  <Chip label={`${afterMedia.length} Photo(s)`} size="small" color={afterMedia.length > 0 ? 'success' : 'default'} sx={{ fontWeight: 700, borderRadius: '9999px' }} />
                </Box>

                {afterMedia.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f3ee', borderRadius: '8px', border: '1px dashed #e2dfd7' }}>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {complaint.status === 'RESOLVED'
                        ? 'Complaint resolved without explicit photo attachment.'
                        : 'Resolution evidence photo will appear here after completion.'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
                    {afterMedia.map((m) => (
                      <Box key={m.id} sx={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #bbf7d0' }}>
                        <img src={m.url} alt={m.caption || 'After photo'} className="w-full h-36 object-cover" />
                        <Typography variant="caption" sx={{ p: 1, display: 'block', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.6875rem', fontWeight: 600 }}>
                          {m.caption || 'Resolution proof photo'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Location & Main Grid */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Department Assignment Panel */}
              <AssignmentPanel
                currentAssignment={complaint.assignment}
                onAssign={handleAssignment}
                isLoading={actionLoading}
              />

              {/* Location Map View */}
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px' }}>
                <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 2, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin className="w-4 h-4 text-[#877b5f]" />
                  <span>Geospatial Incident Location</span>
                </Typography>
                
                <Box sx={{ height: 220, width: '100%', borderRadius: '8px', overflow: 'hidden', mb: 1.5, border: '1px solid #e2dfd7' }}>
                  <MapView complaints={[complaint]} center={[complaint.longitude, complaint.latitude]} zoom={15} interactive={false} />
                </Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: 'monospace' }}>
                  SRID 4326 Point: Lat {complaint.latitude.toFixed(6)}, Lng {complaint.longitude.toFixed(6)}
                </Typography>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Timeline Log */}
              <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px' }}>
                <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 3 }}>
                  Status History & Dispatch Timeline
                </Typography>
                <ComplaintTimeline timeline={complaint.timeline} />
              </Paper>

              {/* Audit Events Log */}
              {auditEvents.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <History className="w-4 h-4 text-[#877b5f]" />
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', fontSize: '0.9375rem' }}>
                      Server Audit Log Events ({auditEvents.length})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {auditEvents.map((evt) => (
                      <Box key={evt.id} sx={{ p: 1.5, backgroundColor: '#f5f3ee', borderRadius: '8px', border: '1px solid #e2dfd7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1f241d', display: 'block', fontFamily: 'monospace' }}>
                            {evt.action}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.6875rem' }}>
                            Actor: {evt.actor_id}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.6875rem' }}>
                          {new Date(evt.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* --- RESOLUTION MODAL --- */}
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Resolve Civic Complaint"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Add completion verification notes and attach resolution/after proof photo.
            </Typography>

            <TextField
              label="Resolution Verification Notes"
              multiline
              rows={3}
              fullWidth
              required
              placeholder="Described completed work, repairs performed, crew details..."
              value={resolutionNotesInput}
              onChange={(e) => setResolutionNotesInput(e.target.value)}
            />

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1f241d', mb: 1, display: 'block' }}>
                Resolution / After Evidence Photo (Optional)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload className="w-4 h-4 text-[#877b5f]" />}
                sx={{ textTransform: 'none', justifyContent: 'flex-start', borderRadius: '8px' }}
              >
                {resolutionFile ? resolutionFile.name : 'Select Resolution Evidence Image File...'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResolutionFile(e.target.files[0]);
                    }
                  }}
                />
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button variant="outlined" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={actionLoading || uploadingResolutionMedia}
                onClick={handleConfirmResolution}
                sx={{ backgroundColor: '#89a577', color: '#ffffff', fontWeight: 700, borderRadius: '8px', '&:hover': { backgroundColor: '#6e895d' } }}
              >
                {uploadingResolutionMedia ? 'Uploading Evidence...' : 'Confirm Resolution'}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* --- REJECTION MODAL --- */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Reject Civic Complaint"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Select a rejection category and enter explanatory details for closing this entry.
            </Typography>

            <TextField
              select
              label="Rejection Reason Category"
              fullWidth
              size="small"
              value={rejectionCategory}
              onChange={(e) => setRejectionCategory(e.target.value)}
            >
              {REJECTION_REASONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Detailed Rejection Notes"
              multiline
              rows={3}
              fullWidth
              placeholder="Explain why this issue is being closed/rejected..."
              value={rejectionNotesInput}
              onChange={(e) => setRejectionNotesInput(e.target.value)}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button variant="outlined" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={actionLoading}
                onClick={handleConfirmRejection}
                sx={{ borderRadius: '8px' }}
              >
                Confirm Rejection
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* --- REOPEN MODAL --- */}
        <Modal
          isOpen={isReopenModalOpen}
          onClose={() => setIsReopenModalOpen(false)}
          title="Reopen Civic Complaint"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Specify the reason for reopening this complaint dossier for further inspection.
            </Typography>

            <TextField
              label="Reopen Explanation Note"
              multiline
              rows={3}
              fullWidth
              required
              placeholder="Reopened due to recurring issue, unverified completion..."
              value={reopenNotesInput}
              onChange={(e) => setReopenNotesInput(e.target.value)}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button variant="outlined" onClick={() => setIsReopenModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={actionLoading}
                onClick={handleConfirmReopen}
                sx={{ backgroundColor: '#89a577', color: '#ffffff', borderRadius: '8px', '&:hover': { backgroundColor: '#6e895d' } }}
              >
                Confirm Reopen
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}

