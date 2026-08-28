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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <LoadingState message="Opening incident dossier..." height="h-96" />
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <ErrorState
          title="Incident Dossier Not Found"
          message={`No civic report matches ID ${complaintId}.`}
        />
      </Container>
    );
  }

  const formattedCreated = new Date(complaint.createdAt).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f3ee', flex: 1, pb: 16 }}>
      <Container maxWidth="lg">
        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', pb: 3, mb: 4, borderBottom: '1px solid #e2e0d8' }}>
          <Link href="/complaints" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog Feed</span>
          </Link>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleUpvote}
              startIcon={<ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-zinc-950 text-zinc-950' : ''}`} />}
            >
              {complaint.upvotesCount} Upvotes
            </Button>

            <Link href={`/admin/complaints/${complaint.id}`}>
              <Button variant="contained" size="small" startIcon={<ShieldCheck className="w-4 h-4" />}>
                Admin Action Desk
              </Button>
            </Link>
          </Box>
        </Box>

        {/* Header Paper */}
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CategoryBadge category={complaint.category} size="medium" />
              <SeverityBadge severity={complaint.severity} size="medium" />
            </Box>
            <StatusBadge status={complaint.status} size="medium" />
          </Box>

          <Typography variant="caption" sx={{ color: '#52525b', fontFamily: 'monospace', display: 'block', mb: 1, fontWeight: 700 }}>
            DOSSIER ID: {complaint.id} • RECORDED {formattedCreated.toUpperCase()}
          </Typography>

          <Typography variant="h3" sx={{ fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em', mb: 2 }}>
            {complaint.title}
          </Typography>

          <Box sx={{ p: 2, backgroundColor: '#f5f3ee', border: '1px solid #e2e0d8', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <MapPin className="w-4 h-4 text-zinc-950 shrink-0" />
            <Typography variant="body2" sx={{ color: '#09090b', fontSize: '0.875rem', fontWeight: 600 }}>
              {complaint.address} ({complaint.latitude.toFixed(4)}° N, {complaint.longitude.toFixed(4)}° E)
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: '#52525b', lineHeight: 1.6 }}>
            {complaint.description}
          </Typography>
        </Paper>

        {/* Content Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            {/* Department Assignment Info */}
            {complaint.assignment && (
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, mb: 2, borderBottom: '1px solid #e2e0d8' }}>
                  <Building2 className="w-4 h-4 text-zinc-950" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#09090b' }}>
                    Department Assignment
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#09090b', fontWeight: 800 }}>
                  {complaint.assignment.department}
                </Typography>
                <Typography variant="caption" sx={{ color: '#52525b', display: 'block', mt: 0.5, fontWeight: 600 }}>
                  Lead Officer: {complaint.assignment.assignedOfficer || 'Unassigned'}
                </Typography>
              </Paper>
            )}

            {/* Resolution Remarks */}
            {complaint.resolutionNotes && (
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#09090b' }}>
                    Verification Remarks
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#52525b', fontFamily: 'monospace' }}>
                  {complaint.resolutionNotes}
                </Typography>
              </Paper>
            )}

            {/* Timeline */}
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid #e2e0d8' }}>
                <Clock className="w-5 h-5 text-zinc-950" />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#09090b' }}>
                  Case Timeline History
                </Typography>
              </Box>
              <ComplaintTimeline timeline={complaint.timeline} />
            </Paper>
          </Grid>

          {/* Right Column Map & Media */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', mb: 4 }}>
              <Typography variant="overline" sx={{ color: '#09090b', fontWeight: 900, mb: 1.5, display: 'block' }}>
                Geospatial Pin
              </Typography>
              <Box sx={{ height: 260, width: '100%', borderRadius: '2px', overflow: 'hidden', border: '1px solid #e2e0d8' }}>
                <MapView
                  complaints={[complaint]}
                  selectedComplaintId={complaint.id}
                  center={[complaint.longitude, complaint.latitude]}
                  zoom={14}
                  interactive={true}
                />
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ImageIcon className="w-4 h-4 text-zinc-950" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#09090b' }}>
                  Photo Evidence
                </Typography>
              </Box>
              {complaint.media.map((item) => (
                <Box key={item.id} sx={{ borderRadius: '2px', overflow: 'hidden', border: '1px solid #e2e0d8', mb: 2 }}>
                  <img src={item.url} alt="" className="w-full h-48 object-cover" />
                  {item.caption && (
                    <Typography variant="caption" sx={{ p: 1, backgroundColor: '#f5f3ee', color: '#52525b', display: 'block', fontFamily: 'monospace', fontWeight: 600 }}>
                      {item.caption}
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
