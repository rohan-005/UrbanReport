'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Category, Severity, Complaint } from '@/lib/types';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { LocationPicker } from '@/components/map/LocationPicker';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { Modal } from '@/components/ui/Modal';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { 
  Send, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Construction,
  Trash2,
  Lightbulb,
  Waves,
  Droplet,
  Activity,
  HelpCircle
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!description.trim()) {
      newErrors.description = 'Problem description is required.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Please provide a detailed description (at least 15 characters).';
    }

    if (!address.trim()) {
      newErrors.address = 'Location address is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const mediaList = imageUrl
        ? [{ id: `med-${Date.now()}`, url: imageUrl, type: 'image' as const, caption: 'Citizen uploaded evidence photo' }]
        : [{
            id: `med-${Date.now()}`,
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
            type: 'image' as const,
            caption: 'Default evidence preview',
          }];

      const newReport = await complaintRepository.createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        severity,
        status: 'SUBMITTED',
        latitude,
        longitude,
        address: address.trim(),
        reporter: {
          id: 'user-001',
          name: 'Aarav Sharma',
        },
        media: mediaList,
      });

      setCreatedComplaint(newReport);
      setIsSuccessModalOpen(true);
    } catch {
      setErrors({ form: 'Failed to submit report. Please check input.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ py: 8, backgroundColor: '#09090b', flex: 1 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#f8fafc', mb: 1 }}>
            Report a Civic Incident
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
            Pinpoint infrastructure issues for immediate municipal dispatch.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ spaceY: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Step 1: Category */}
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', mb: 3 }}>
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
                          borderColor: isSelected ? '#f8fafc' : '#27272a',
                          backgroundColor: isSelected ? '#18181b' : '#09090b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: '#52525b' },
                        }}
                      >
                        <Box sx={{ color: isSelected ? '#ffffff' : '#a1a1aa', mb: 1 }}>
                          <Icon className="w-5 h-5" />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#e4e4e7', fontSize: '0.875rem' }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#71717a', fontSize: '0.6875rem', display: 'block', mt: 0.5, lineHeight: 1.2 }}>
                          {cat.description}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>

            {/* Step 2: Details */}
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px', spaceY: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', mb: 3 }}>
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
                  <Typography variant="overline" sx={{ color: '#a1a1aa', fontWeight: 800, mb: 1.5, display: 'block' }}>
                    Assess Severity Level
                  </Typography>

                  <Grid container spacing={2}>
                    {severities.map((sev) => {
                      const isSelected = severity === sev.value;
                      return (
                        <Grid item xs={12} sm={3} key={sev.value}>
                          <Box
                            onClick={() => setSeverity(sev.value)}
                            sx={{
                              p: 2,
                              borderRadius: '2px',
                              border: '1px solid',
                              borderColor: isSelected ? '#f8fafc' : '#27272a',
                              backgroundColor: isSelected ? '#18181b' : '#09090b',
                              cursor: 'pointer',
                              height: '100%',
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <SeverityBadge severity={sev.value} size="small" />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#a1a1aa', fontSize: '0.6875rem', display: 'block', lineHeight: 1.3 }}>
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
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', mb: 3 }}>
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
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', mb: 3 }}>
                4. Photo Evidence
              </Typography>

              <ImageUploader onImageSelected={(url) => setImageUrl(url)} />
            </Paper>

            {/* Submit Action */}
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#71717a' }}>
                Generates a tracking ID and notifies ward control.
              </Typography>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                startIcon={<Send className="w-4 h-4" />}
                sx={{
                  backgroundColor: '#f8fafc',
                  color: '#09090b',
                  fontWeight: 900,
                  px: 4,
                  '&:hover': { backgroundColor: '#e2e8f0' },
                }}
              >
                Submit Report
              </Button>
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
            <Box sx={{ textCenter: 'center', py: 2, spaceY: 3 }}>
              <Box sx={{ display: 'flex', justifyCenter: 'center', mb: 2 }}>
                <CheckCircle2 className="w-12 h-12 text-zinc-100" />
              </Box>

              <Typography variant="overline" sx={{ color: '#a1a1aa', fontWeight: 800 }}>
                TRACKING REFERENCE ID
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>
                {createdComplaint.id}
              </Typography>

              <Typography variant="body2" sx={{ color: '#a1a1aa', mt: 2, mb: 4 }}>
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
  );
}
