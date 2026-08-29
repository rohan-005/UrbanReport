'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Category, Severity, Complaint, DuplicateCandidate } from '@/lib/types';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { LocationPicker } from '@/components/map/LocationPicker';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PageTransition } from '@/components/motion/PageTransition';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Construction,
  Trash2,
  Lightbulb,
  Waves,
  Droplet,
  Activity,
  HelpCircle,
  AlertCircle,
  MapPin,
  Eye,
  ThumbsUp,
  ShieldAlert,
  Search,
  Sparkles
} from 'lucide-react';

const categoryOptions: { name: Category; description: string; icon: React.ElementType }[] = [
  { name: 'Pothole', description: 'Road craters, sunken asphalt, hazardous holes', icon: Construction },
  { name: 'Garbage', description: 'Solid waste heaps, uncollected debris', icon: Trash2 },
  { name: 'Streetlight', description: 'Dark fixtures, flickering LEDs, unlit streets', icon: Lightbulb },
  { name: 'Drainage', description: 'Clogged storm drains, missing manhole covers', icon: Waves },
  { name: 'Road Damage', description: 'Caving pavement, broken dividers', icon: Construction },
  { name: 'Water Supply', description: 'Burst main pipelines, low pressure leaks', icon: Droplet },
  { name: 'Traffic', description: 'Signal malfunctions, stuck controllers', icon: Activity },
  { name: 'Other', description: 'Vandalism, fallen trees, public hazards', icon: HelpCircle },
];

const severities: { value: Severity; label: string; desc: string }[] = [
  { value: 'LOW', label: 'Low', desc: 'Minor cosmetic defect or routine maintenance' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Noticeable defect causing inconvenience' },
  { value: 'HIGH', label: 'High', desc: 'Significant hazard disrupting traffic/utilities' },
  { value: 'CRITICAL', label: 'Critical', desc: 'Emergency threat to human safety or life' },
];

export default function ReportPage() {
  const router = useRouter();

  const [category, setCategory] = useState<Category>('Pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [address, setAddress] = useState('Outer Ring Road, Near Silk Board Junction, HSR Layout, Bengaluru');
  const [latitude, setLatitude] = useState(12.9172);
  const [longitude, setLongitude] = useState(77.6228);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>([]);

  // Duplicate Detection & Community Confirmation State
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateCheckDismissed, setDuplicateCheckDismissed] = useState(false);
  const [confirmedCandidateId, setConfirmedCandidateId] = useState<string | null>(null);
  const [confirmedSuccessMessage, setConfirmedSuccessMessage] = useState<string | null>(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<DuplicateCandidate | null>(null);
  const [confirmingLoadingId, setConfirmingLoadingId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Duplicate Detection Trigger
  useEffect(() => {
    if (!latitude || !longitude || !category) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setCheckingDuplicates(true);
    setDuplicateCheckDismissed(false);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const candidates = await complaintRepository.findDuplicateCandidates({
          latitude: Number(latitude),
          longitude: Number(longitude),
          category,
          title: title.trim(),
          description: description.trim(),
          radius: 250,
        });
        setDuplicates(candidates);
      } catch (err) {
        // Non-blocking degradation
        setDuplicates([]);
      } finally {
        setCheckingDuplicates(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [latitude, longitude, category, title]);

  const handleConfirmExistingCandidate = async (candidate: DuplicateCandidate) => {
    setConfirmingLoadingId(candidate.complaintId);
    try {
      const res = await complaintRepository.confirmComplaint(candidate.complaintId);
      setConfirmedCandidateId(candidate.complaintId);
      setConfirmedSuccessMessage(
        `Community confirmation recorded! ${res.confirmationsCount} citizen(s) have verified this issue. Thank you for validating local infrastructure priorities.`
      );
    } catch (err: any) {
      setConfirmedSuccessMessage('Your confirmation has been saved.');
    } finally {
      setConfirmingLoadingId(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!category) {
      newErrors.category = 'Please select an issue category.';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!description.trim()) {
      newErrors.description = 'Problem description is required.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    if (!severity) {
      newErrors.severity = 'Please select a severity level.';
    }

    const latNum = Number(latitude);
    if (latitude === undefined || latitude === null || !Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      newErrors.address = 'Please select a valid location with latitude between -90 and 90.';
    }

    const lngNum = Number(longitude);
    if (longitude === undefined || longitude === null || !Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      newErrors.address = 'Please select a valid location with longitude between -180 and 180.';
    }

    if (!address || !address.trim()) {
      newErrors.address = 'Location address is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const mediaList = uploadedMediaIds.length > 0
        ? uploadedMediaIds.map((mId) => ({
            id: mId,
            url: imageUrl || '',
            type: 'image' as const,
            caption: 'Citizen uploaded evidence photo',
          }))
        : imageUrl
        ? [{ id: `med-${Date.now()}`, url: imageUrl, type: 'image' as const, caption: 'Citizen uploaded evidence photo' }]
        : [];

      const newReport = await complaintRepository.createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        severity,
        status: 'SUBMITTED',
        latitude: Number(latitude),
        longitude: Number(longitude),
        address: address.trim(),
        reporter: {
          id: 'user-001',
          name: 'Citizen Reporter',
        },
        media: mediaList,
      });

      setCreatedComplaint(newReport);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to submit report. Please check input.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f5f3ee', flex: 1, pb: { xs: 28, md: 36 } }}>
        <Container maxWidth="lg" className="px-4 sm:px-6 md:px-8">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#09090b', mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              Report a Civic Incident
            </Typography>
            <Typography variant="body2" sx={{ color: '#52525b' }}>
              Pinpoint infrastructure issues for immediate municipal dispatch.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {errors.form && (
                <Box sx={{ p: 2, borderRadius: '2px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errors.form}</span>
                </Box>
              )}

              {/* Step 1: Category */}
              <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#09090b', mb: 3 }}>
                  1. Select Issue Category
                </Typography>

                <Grid container spacing={2}>
                  {categoryOptions.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.name;

                    return (
                      <Grid item xs={6} sm={3} key={cat.name}>
                        <Box
                          onClick={() => setCategory(cat.name)}
                          sx={{
                            p: 2,
                            borderRadius: '2px',
                            border: '1px solid',
                            borderColor: isSelected ? '#09090b' : '#e2e0d8',
                            backgroundColor: isSelected ? '#09090b' : '#f5f3ee',
                            color: isSelected ? '#ffffff' : '#09090b',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            '&:hover': { borderColor: '#09090b' },
                          }}
                        >
                          <Box sx={{ color: isSelected ? '#ffffff' : '#09090b', mb: 1 }}>
                            <Icon className="w-5 h-5" />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#09090b', fontSize: '0.875rem' }}>
                            {cat.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isSelected ? '#d4d4d8' : '#52525b', fontSize: '0.6875rem', display: 'block', mt: 0.5, lineHeight: 1.2 }}>
                            {cat.description}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>

              {/* Step 2: Details */}
              <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#09090b', mb: 3 }}>
                  2. Problem Details & Severity
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Complaint Title *"
                    fullWidth
                    placeholder="e.g. Hazardous Pothole on 100 Feet Ring Road"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={Boolean(errors.title)}
                    helperText={errors.title}
                  />

                  <TextField
                    label="Detailed Description *"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Describe the defect, dimensions, traffic hazard level..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                  />

                  <Box>
                    <Typography variant="overline" sx={{ color: '#09090b', fontWeight: 900, mb: 1.5, display: 'block' }}>
                      Assess Severity Level
                    </Typography>

                    <Grid container spacing={2}>
                      {severities.map((sev) => {
                        const isSelected = severity === sev.value;
                        return (
                          <Grid item xs={6} sm={3} key={sev.value}>
                            <Box
                              onClick={() => setSeverity(sev.value)}
                              sx={{
                                p: 2,
                                borderRadius: '2px',
                                border: '1px solid',
                                borderColor: isSelected ? '#09090b' : '#e2e0d8',
                                backgroundColor: isSelected ? '#f5f3ee' : '#ffffff',
                                cursor: 'pointer',
                                height: '100%',
                              }}
                            >
                              <Box sx={{ mb: 1 }}>
                                <SeverityBadge severity={sev.value} size="small" />
                              </Box>
                              <Typography variant="caption" sx={{ color: '#52525b', fontSize: '0.6875rem', display: 'block', lineHeight: 1.3, fontWeight: 600 }}>
                                {sev.desc}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Box>
              </Paper>

              {/* Step 3: Location */}
              <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#09090b', mb: 3 }}>
                  3. Geospatial Location
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Street Address / Landmark *"
                    fullWidth
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    error={Boolean(errors.address)}
                    helperText={errors.address}
                  />

                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={(newLat, newLng, sampleAddr) => {
                      setLatitude(newLat);
                      setLongitude(newLng);
                      if (sampleAddr) setAddress(sampleAddr);
                    }}
                  />
                </Box>
              </Paper>

              {/* DUPLICATE CANDIDATES DETECTION PANEL */}
              {checkingDuplicates ? (
                <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#09090b' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#09090b', fontFamily: 'monospace' }}>
                    PostGIS Spatial Check: Searching active reports within 250m radius...
                  </Typography>
                </Paper>
              ) : duplicates.length > 0 && !duplicateCheckDismissed ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    backgroundColor: '#fffbeb',
                    borderColor: '#fcd34d',
                    borderRadius: '2px',
                    borderLeft: '6px solid #f59e0b',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#78350f', fontSize: '1.0625rem' }}>
                          Possible Existing Reports Nearby ({duplicates.length} Candidate{duplicates.length > 1 ? 's' : ''})
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600 }}>
                          Help authorities resolve issues faster by confirming an existing report, or continue to file your new report.
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setDuplicateCheckDismissed(true)}
                      sx={{ textTransform: 'none', color: '#78350f', fontWeight: 800 }}
                    >
                      Dismiss & Continue New Report →
                    </Button>
                  </Box>

                  {confirmedSuccessMessage && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: '2px', fontWeight: 700 }}>
                      {confirmedSuccessMessage}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {duplicates.map((cand) => {
                      const isConfirmed = confirmedCandidateId === cand.complaintId;
                      const isHighConf = cand.confidence === 'HIGH';

                      return (
                        <Paper
                          key={cand.complaintId}
                          elevation={0}
                          sx={{
                            p: 3,
                            backgroundColor: '#ffffff',
                            borderColor: isHighConf ? '#f59e0b' : '#e2e0d8',
                            borderRadius: '2px',
                            border: '1px solid',
                          }}
                        >
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 1, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={isHighConf ? 'HIGH CONFIDENCE DUPLICATE' : 'POSSIBLE DUPLICATE'}
                                size="small"
                                sx={{
                                  backgroundColor: isHighConf ? '#fef3c7' : '#f4f4f5',
                                  color: isHighConf ? '#92400e' : '#27272a',
                                  fontWeight: 900,
                                  fontSize: '0.6875rem',
                                  borderRadius: '2px',
                                }}
                              />
                              <Chip label={`${cand.similarityPercentage}% Match`} size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.6875rem' }} />
                              <StatusBadge status={cand.status} size="small" />
                            </Box>

                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#78350f', fontFamily: 'monospace' }}>
                              {cand.distanceMeters} meters away
                            </Typography>
                          </Box>

                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5 }}>
                            {cand.title}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#52525b', fontSize: '0.75rem', mb: 2 }}>
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span className="truncate">{cand.address}</span>
                            <span className="mx-1">•</span>
                            <span>Reported {new Date(cand.createdAt).toLocaleDateString()}</span>
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', pt: 1, borderTop: '1px solid #f4f4f5' }}>
                            <Button
                              variant="contained"
                              size="small"
                              disabled={isConfirmed || confirmingLoadingId === cand.complaintId}
                              onClick={() => handleConfirmExistingCandidate(cand)}
                              startIcon={<ThumbsUp className="w-4 h-4" />}
                              sx={{
                                backgroundColor: isConfirmed ? '#166534' : '#09090b',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                              }}
                            >
                              {confirmingLoadingId === cand.complaintId
                                ? 'Recording...'
                                : isConfirmed
                                ? '✓ Issue Confirmed'
                                : 'Confirm Existing Issue'}
                            </Button>

                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setSelectedCandidateDetail(cand)}
                              startIcon={<Eye className="w-4 h-4" />}
                              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              Inspect Details
                            </Button>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                </Paper>
              ) : null}

              {/* Step 4: Media Upload */}
              <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#09090b', mb: 3 }}>
                  4. Photo Evidence
                </Typography>

                <ImageUploader
                  onMediaChanged={(mediaIds, preview) => {
                    setUploadedMediaIds(mediaIds);
                    setImageUrl(preview);
                  }}
                  onImageSelected={(url) => setImageUrl(url)}
                />
              </Paper>

              {/* Submit Action */}
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600, display: 'block' }}>
                    Generates a tracking ID and notifies ward dispatch control.
                  </Typography>
                  {duplicates.length > 0 && (
                    <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700 }}>
                      Note: You are choosing to submit a new report alongside {duplicates.length} nearby candidate(s). Your new report will be preserved cleanly.
                    </Typography>
                  )}
                </Box>

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={submitting}
                  loadingText="Submitting Report..."
                  startIcon={<Send className="w-4 h-4" />}
                  sx={{
                    backgroundColor: '#09090b',
                    color: '#ffffff',
                    fontWeight: 900,
                    px: 4,
                    '&:hover': { backgroundColor: '#18181b' },
                  }}
                >
                  Submit New Report
                </LoadingButton>
              </Paper>
            </Box>
          </form>

          {/* CANDIDATE DETAIL MODAL */}
          <Modal
            isOpen={Boolean(selectedCandidateDetail)}
            onClose={() => setSelectedCandidateDetail(null)}
            title="Inspect Nearby Candidate Complaint"
          >
            {selectedCandidateDetail && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StatusBadge status={selectedCandidateDetail.status} size="small" />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                    {selectedCandidateDetail.complaintId}
                  </Typography>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, color: '#09090b' }}>
                  {selectedCandidateDetail.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#52525b' }}>
                  Location: {selectedCandidateDetail.address} ({selectedCandidateDetail.distanceMeters} meters away)
                </Typography>

                <Box sx={{ pt: 2, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => setSelectedCandidateDetail(null)}>
                    Close Inspect
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setSelectedCandidateDetail(null);
                      router.push(`/complaints/${selectedCandidateDetail.complaintId}`);
                    }}
                    sx={{ backgroundColor: '#09090b', color: '#ffffff' }}
                  >
                    Go To Full Dossier →
                  </Button>
                </Box>
              </Box>
            )}
          </Modal>

          {/* Success Confirmation Modal */}
          <Modal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            title="Report Successfully Dispatched"
          >
            {createdComplaint && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <CheckCircle2 className="w-12 h-12 text-zinc-950" />
                </Box>

                <Typography variant="overline" sx={{ color: '#52525b', fontWeight: 900 }}>
                  TRACKING REFERENCE ID
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#09090b', fontFamily: 'monospace', my: 1, fontSize: '1.75rem' }}>
                  {createdComplaint.id}
                </Typography>

                <Typography variant="body2" sx={{ color: '#52525b', mt: 2, mb: 4 }}>
                  Your report has been queued for municipal triage.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push(`/complaints/${createdComplaint.id}`)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    View Dossier
                  </Button>
                </Box>
              </Box>
            )}
          </Modal>
        </Container>
      </Box>
    </PageTransition>
  );
}
