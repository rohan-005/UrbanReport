'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Category, Severity, Complaint } from '@/lib/types';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { LocationPicker } from '@/components/map/LocationPicker';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
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
  AlertCircle
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
                <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>
                  Generates a tracking ID and notifies ward control.
                </Typography>

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
                  Submit Report
                </LoadingButton>
              </Paper>
            </Box>
          </form>

          {/* Confirmation Modal */}
          <Modal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            title="Report Successfully Dispatched"
          >
            {createdComplaint && (
              <Box sx={{ textCenter: 'center', py: 2 }}>
                <Box sx={{ display: 'flex', justifyCenter: 'center', mb: 2 }}>
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
