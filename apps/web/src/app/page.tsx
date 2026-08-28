'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, Category } from '@/lib/types';
import { MapView } from '@/components/map/MapView';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { FadeIn } from '@/components/motion/FadeIn';
import { animateHeroTitle } from '@/lib/motion/gsap';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { 
  MapPin, 
  Plus, 
  Compass, 
  ArrowRight,
  Construction,
  Trash2,
  Lightbulb,
  Waves,
  Droplet,
  Activity,
  HelpCircle
} from 'lucide-react';

const categoryItems: { name: Category; count: string; icon: React.ElementType }[] = [
  { name: 'Pothole', count: '450+ Resolved', icon: Construction },
  { name: 'Garbage', count: '320+ Cleaned', icon: Trash2 },
  { name: 'Streetlight', count: '280+ Fixed', icon: Lightbulb },
  { name: 'Drainage', count: '190+ Unblocked', icon: Waves },
  { name: 'Road Damage', count: '210+ Patched', icon: Construction },
  { name: 'Water Supply', count: '160+ Repaired', icon: Droplet },
  { name: 'Traffic', count: '140+ Synced', icon: Activity },
  { name: 'Other', count: '90+ Addressed', icon: HelpCircle },
];

export default function LandingHomePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await complaintRepository.getAllComplaints();
      const statsData = await complaintRepository.getStats();
      setComplaints(data);
      setStats(statsData);
    };
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      animateHeroTitle(heroRef.current);
    }
  }, []);

  return (
    <Box sx={{ backgroundColor: '#09090b', color: '#f8fafc', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Editorial Hero Header */}
      <Box sx={{ borderBottom: '1px solid #27272a', py: { xs: 6, md: 10 }, backgroundColor: '#09090b' }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            {/* Left Content */}
            <Grid item xs={12} lg={5}>
              <Box ref={heroRef} sx={{ spaceY: 3 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '2px',
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    color: '#a1a1aa',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    mb: 2,
                  }}
                >
                  <span className="w-1.5 h-1.5 bg-zinc-100 rounded-none inline-block" />
                  <span>Geospatial Civic Intelligence</span>
                </Box>

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.75rem', lg: '4.25rem' },
                    fontWeight: 900,
                    color: '#f8fafc',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    mb: 2,
                  }}
                >
                  URBANREPORTS
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: '#e4e4e7',
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', sm: '1.35rem' },
                    lineHeight: 1.4,
                    mb: 3,
                  }}
                >
                  Report it. Track it. Improve your city.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#a1a1aa',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    mb: 4,
                    maxWidth: 520,
                  }}
                >
                  Map-first civic reporting platform empowering citizens to pinpoint potholes, garbage, streetlights, and water leaks directly to municipal dispatch teams.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Link href="/report">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                      sx={{
                        backgroundColor: '#f8fafc',
                        color: '#09090b',
                        fontWeight: 900,
                        px: 3.5,
                        py: 1.25,
                        borderRadius: '2px',
                        '&:hover': { backgroundColor: '#e2e8f0' },
                      }}
                    >
                      Report an Issue
                    </Button>
                  </Link>

                  <Link href="/map">
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Compass className="w-4 h-4" />}
                      sx={{
                        borderColor: '#27272a',
                        color: '#f8fafc',
                        fontWeight: 800,
                        px: 3.5,
                        py: 1.25,
                        borderRadius: '2px',
                        '&:hover': { borderColor: '#52525b', backgroundColor: '#18181b' },
                      }}
                    >
                      Explore Map
                    </Button>
                  </Link>
                </Box>

                {stats && (
                  <Grid container spacing={2} sx={{ pt: 4, mt: 2, borderTop: '1px solid #27272a' }}>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc' }}>
                        {stats.total}+
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Reports Filed
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff' }}>
                        {stats.resolved}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Resolved
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#e4e4e7' }}>
                        {stats.inProgress}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Active Work
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Grid>

            {/* Right Map Canvas Preview */}
            <Grid item xs={12} lg={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  backgroundColor: '#121215',
                  borderColor: '#27272a',
                  borderRadius: '2px',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    borderBottom: '1px solid #27272a',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPin className="w-4 h-4 text-zinc-100" />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      City Geospatial Canvas
                    </Typography>
                  </Box>
                  <Link href="/map" className="text-xs font-bold text-zinc-100 uppercase tracking-wider hover:underline">
                    Fullscreen Map →
                  </Link>
                </Box>

                <Box sx={{ height: { xs: 340, sm: 440 }, width: '100%', borderRadius: '2px', overflow: 'hidden', border: '1px solid #27272a' }}>
                  <MapView complaints={complaints} zoom={12} interactive={true} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Category Grid */}
      <Box sx={{ py: 10, borderBottom: '1px solid #27272a', backgroundColor: '#121215' }}>
        <Container maxWidth="xl">
          <FadeIn>
            <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#f8fafc', mb: 1 }}>
                Infrastructure Categories
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                Categorized issue tracking automatically dispatched to municipal sector units.
              </Typography>
            </Box>
          </FadeIn>

          <Grid container spacing={2}>
            {categoryItems.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Grid item xs={6} sm={3} key={cat.name}>
                  <FadeIn delay={idx * 0.05}>
                    <Link href={`/complaints?category=${cat.name}`} style={{ textDecoration: 'none' }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '2px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#52525b',
                            backgroundColor: '#18181b',
                          },
                        }}
                      >
                        <Box sx={{ p: 1.5, borderRadius: '2px', backgroundColor: '#18181b', border: '1px solid #27272a', width: 'fit-content', color: '#f8fafc', mb: 2 }}>
                          <Icon className="w-5 h-5" />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', mb: 0.5 }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#a1a1aa', fontFamily: 'monospace' }}>
                          {cat.count}
                        </Typography>
                      </Paper>
                    </Link>
                  </FadeIn>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Recent Feed */}
      <Box sx={{ py: 10, backgroundColor: '#09090b' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 6 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc' }}>
                Recent Civic Dossiers
              </Typography>
              <Typography variant="caption" sx={{ color: '#a1a1aa' }}>
                Active infrastructure issues reported by citizens.
              </Typography>
            </Box>
            <Link href="/complaints">
              <Button variant="outlined" size="small" endIcon={<ArrowRight className="w-4 h-4" />}>
                View All Feed
              </Button>
            </Link>
          </Box>

          <Grid container spacing={3}>
            {complaints.slice(0, 3).map((item, idx) => (
              <Grid item xs={12} md={4} key={item.id}>
                <FadeIn delay={idx * 0.1}>
                  <ComplaintCard complaint={item} />
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
