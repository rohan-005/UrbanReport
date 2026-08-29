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
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ComplaintImage } from '@/components/ui/ComplaintImage';
import { PageTransition } from '@/components/motion/PageTransition';
import { MediaService } from '@/lib/services/mediaService';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { 
  ArrowLeft, 
  MapPin, 
  ThumbsUp, 
  ShieldCheck, 
  Clock, 
  Building2,
  CheckCircle2,
  Image as ImageIcon
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
    const unsubscribe = complaintRepository.subscribe(() => loadComplaint());
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

  const handleConfirm = async () => {
    if (!complaint) return;
    try {
      const res = await complaintRepository.confirmComplaint(complaint.id);
      setComplaint({
        ...complaint,
        confirmationsCount: res.confirmationsCount,
        hasUserConfirmed: true,
        upvotesCount: Math.max(complaint.upvotesCount, res.confirmationsCount),
      });
    } catch {}
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <LoadingState message="Opening incident dossier..." height="h-96" />
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <ErrorState
          title="Incident Dossier Not Found"
          message={`No civic report matches ID ${complaintId}.`}
        />
      </Container>
    );
  }

  const formattedCreated = new Date(complaint.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <PageTransition>
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f5f3ee', flex: 1, pb: { xs: 28, md: 36 } }}>
        <Container maxWidth={false} className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Navigation */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #e2dfd7', gap: 2 }}>
            <Link href="/complaints" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#877b5f] hover:text-[#1f241d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
              <ArrowLeft className="w-4 h-4 text-[#877b5f]" />
              <span>Return to Catalog Feed</span>
            </Link>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Button
                variant={complaint.hasUserConfirmed ? 'contained' : 'outlined'}
                size="small"
                onClick={handleConfirm}
                disabled={complaint.hasUserConfirmed}
                startIcon={<ThumbsUp className="w-4 h-4" />}
                sx={{
                  backgroundColor: complaint.hasUserConfirmed ? '#4e6d3c' : undefined,
                  color: complaint.hasUserConfirmed ? '#ffffff' : undefined,
                  fontWeight: 700,
                  borderRadius: '8px',
                }}
              >
                {complaint.hasUserConfirmed ? '✓ Confirmed by You' : 'Confirm Issue'} ({complaint.confirmationsCount || complaint.upvotesCount})
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={handleUpvote}
                startIcon={<ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-[#89a577] text-[#89a577]' : 'text-[#877b5f]'}`} />}
                sx={{ borderRadius: '8px' }}
              >
                {complaint.upvotesCount} Upvotes
              </Button>

              <Link href={`/admin/complaints/${complaint.id}`}>
                <Button variant="contained" size="small" startIcon={<ShieldCheck className="w-4 h-4" />} sx={{ backgroundColor: '#89a577', borderRadius: '8px', '&:hover': { backgroundColor: '#6e895d' } }}>
                  Admin Action Desk
                </Button>
              </Link>
            </Box>
          </Box>

          {/* Header Paper */}
          <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CategoryBadge category={complaint.category} size="medium" />
                <SeverityBadge severity={complaint.severity} size="medium" />
              </Box>
              <StatusBadge status={complaint.status} size="medium" />
            </Box>

            <Typography variant="caption" sx={{ color: '#877b5f', fontFamily: 'monospace', display: 'block', mb: 1, fontWeight: 700 }}>
              DOSSIER ID: {complaint.id} • RECORDED {formattedCreated.toUpperCase()}
            </Typography>

            <Typography variant="h3" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', letterSpacing: '-0.01em', mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              {complaint.title}
            </Typography>

            <Box sx={{ p: 2, backgroundColor: '#f5f3ee', border: '1px solid #e2dfd7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <MapPin className="w-4 h-4 text-[#877b5f] shrink-0" />
              <Typography variant="body2" sx={{ color: '#1f241d', fontSize: '0.875rem', fontWeight: 600 }}>
                {complaint.address} ({complaint.latitude.toFixed(4)}° N, {complaint.longitude.toFixed(4)}° E)
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
              {complaint.description}
            </Typography>
          </Paper>

          {/* Content Grid */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              {/* Department Assignment Info */}
              {complaint.assignment && (
                <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, mb: 2, borderBottom: '1px solid #e2dfd7' }}>
                    <Building2 className="w-4 h-4 text-[#877b5f]" />
                    <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                      Department Assignment
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#1f241d', fontWeight: 700 }}>
                    {complaint.assignment.department}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5, fontWeight: 600 }}>
                    Lead Officer: {complaint.assignment.assignedOfficer || 'Unassigned'}
                  </Typography>
                </Paper>
              )}

              {/* Resolution Remarks */}
              {complaint.resolutionNotes && (
                <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircle2 className="w-4 h-4 text-[#89a577]" />
                    <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                      Verification Remarks
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: 'monospace' }}>
                    {complaint.resolutionNotes}
                  </Typography>
                </Paper>
              )}

              {/* Timeline */}
              <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid #e2dfd7' }}>
                  <Clock className="w-5 h-5 text-[#877b5f]" />
                  <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                    Case Timeline History
                  </Typography>
                </Box>
                <ComplaintTimeline timeline={complaint.timeline} />
              </Paper>
            </Grid>

            {/* Right Column Map & Media */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', mb: 4 }}>
                <Typography variant="overline" sx={{ color: '#877b5f', fontWeight: 700, mb: 1.5, display: 'block' }}>
                  Geospatial Pin
                </Typography>
                <Box sx={{ height: 280, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2dfd7' }}>
                  <MapView
                    complaints={[complaint]}
                    selectedComplaintId={complaint.id}
                    center={[complaint.longitude, complaint.latitude]}
                    zoom={14}
                    interactive={true}
                  />
                </Box>
              </Paper>

              {complaint.media && complaint.media.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ImageIcon className="w-4 h-4 text-[#877b5f]" />
                    <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                      Photo Evidence
                    </Typography>
                  </Box>

                  {complaint.media.map((item) => (
                    <Box key={item.id} sx={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2dfd7', mb: 2 }}>
                      <ComplaintImage
                        src={MediaService.getMediaUrl(item.url)}
                        alt={item.caption || 'Photo evidence'}
                        height={220}
                      />
                      {item.caption && (
                        <Typography variant="caption" sx={{ p: 1, backgroundColor: '#f5f3ee', color: '#6b7280', display: 'block', fontFamily: 'monospace', fontWeight: 600 }}>
                          {item.caption}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PageTransition>
  );
}

