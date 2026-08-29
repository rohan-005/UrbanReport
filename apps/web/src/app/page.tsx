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
    <Box sx={{ backgroundColor: 'transparent', color: '#1f241d', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Editorial Hero Header */}
      <Box sx={{ borderBottom: '1px solid #2d342b', py: { xs: 6, md: 10 }, backgroundColor: 'rgba(25, 27, 24, 0.85)', backdropFilter: 'blur(12px)', color: '#f5f3ee' }}>
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
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(34, 38, 32, 0.9)',
                    border: '1px solid #3a4235',
                    color: '#a8c38e',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    mb: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <span className="w-1.5 h-1.5 bg-[#89a577] rounded-full inline-block" />
                  <span>Geospatial Civic Intelligence</span>
                </Box>

                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: 'var(--font-display), Lora, Georgia, serif',
                    fontSize: { xs: '2.5rem', sm: '3.75rem', lg: '4.25rem' },
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.05,
                    mb: 2,
                  }}
                >
                  UrbanReports
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: '#b8a184',
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', sm: '1.35rem' },
                    lineHeight: 1.4,
                    mb: 1,
                  }}
                >
                  Report it. Track it. Improve your community.
                </Typography>
                <Typography
                  className="font-accent"
                  sx={{
                    color: '#a8c38e',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 400,
                    mb: 3,
                    display: 'block',
                  }}
                >
                  Report an issue. Make your street better.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#d1cdc4',
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
                        backgroundColor: '#89a577',
                        color: '#ffffff',
                        fontWeight: 700,
                        px: 3.5,
                        py: 1.25,
                        borderRadius: '8px',
                        '&:hover': { backgroundColor: '#6e895d' },
                      }}
                    >
                      Report an Issue
                    </Button>
                  </Link>

                  <Link href="/map">
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Compass className="w-4 h-4 text-[#b8a184]" />}
                      sx={{
                        borderColor: '#3a4235',
                        color: '#f5f3ee',
                        fontWeight: 700,
                        px: 3.5,
                        py: 1.25,
                        borderRadius: '8px',
                        '&:hover': { borderColor: '#b8a184', backgroundColor: 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      Explore Map
                    </Button>
                  </Link>
                </Box>

                {stats && (
                  <Grid container spacing={2} sx={{ pt: 4, mt: 2, borderTop: '1px solid #2d342b' }}>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#ffffff' }}>
                        {stats.total}+
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#b8a184', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                        Reports Filed
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#ffffff' }}>
                        {stats.resolved}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#b8a184', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                        Resolved
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#ffffff' }}>
                        {stats.inProgress}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#b8a184', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
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
                  backgroundColor: '#ffffff',
                  borderColor: '#e2dfd7',
                  borderRadius: '8px',
                  position: 'relative',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    borderBottom: '1px solid #e2dfd7',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPin className="w-4 h-4 text-[#89a577]" />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1f241d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      City Geospatial Canvas
                    </Typography>
                  </Box>
                  <Link href="/map" className="text-xs font-bold text-[#89a577] uppercase tracking-wider hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                    Fullscreen Map →
                  </Link>
                </Box>

                <Box sx={{ height: { xs: 340, sm: 440 }, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2dfd7' }}>
                  <MapView complaints={complaints} zoom={12} interactive={true} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Category Grid */}
      <Box sx={{ py: 10, borderBottom: '1px solid #e2dfd7', backgroundColor: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(6px)' }}>
        <Container maxWidth="xl">
          <FadeIn>
            <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}>
              <Typography variant="h3" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 1 }}>
                Infrastructure Categories
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Categorized issue tracking automatically dispatched to municipal sector units.
              </Typography>
            </Box>
          </FadeIn>

          <Grid container spacing={2}>
            {categoryItems.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Grid item xs={6} sm={3} key={cat.name}>
                  <FadeIn delay={idx * 0.04}>
                    <Link href={`/complaints?category=${cat.name}`} style={{ textDecoration: 'none' }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          backgroundColor: '#f5f3ee',
                          borderColor: '#e2dfd7',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#877b5f',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 12px rgba(31,36,29,0.06)',
                          },
                        }}
                      >
                        <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#89a577', width: 'fit-content', color: '#ffffff', mb: 2 }}>
                          <Icon className="w-5 h-5" />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f241d', fontSize: '1rem', mb: 0.5 }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: 'monospace', fontWeight: 600 }}>
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
      <Box sx={{ py: 10, backgroundColor: 'rgba(245, 243, 238, 0.95)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d' }}>
                Recent Civic Dossiers
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
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
              <Grid item xs={12} md={4} key={item.id} sx={{ display: 'flex' }}>
                <FadeIn delay={idx * 0.08} className="w-full flex flex-col h-full">
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


