'use client';

import React, { useEffect, useState } from 'react';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintFilters, Category, Severity, ComplaintStatus } from '@/lib/types';
import { MapView } from '@/components/map/MapView';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import { Search, MapPin, ArrowRight, X, Plus, ListFilter } from 'lucide-react';
import Link from 'next/link';

const categories: (Category | 'ALL')[] = [
  'ALL',
  'Pothole',
  'Garbage',
  'Streetlight',
  'Drainage',
  'Road Damage',
  'Water Supply',
  'Traffic',
  'Other',
];

const severities: (Severity | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const statuses: (ComplaintStatus | 'ALL')[] = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REOPENED',
];

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [filters, setFilters] = useState<ComplaintFilters>({
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    searchQuery: '',
  });

  const loadData = async () => {
    setLoading(true);
    const data = await complaintRepository.getAllComplaints(filters);
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, [filters]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0rem)', backgroundColor: '#09090b', pb: 10 }}>
      {/* Header Controls */}
      <Box sx={{ borderBottom: '1px solid #27272a', px: 3, py: 2, backgroundColor: '#121215', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MapPin className="w-5 h-5 text-zinc-100" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
              Geospatial Complaint Map
            </Typography>
            <Typography variant="caption" sx={{ color: '#a1a1aa' }}>
              Showing <span className="font-bold text-white">{complaints.length}</span> active civic incident records
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Link href="/report">
            <Button size="small" variant="contained" startIcon={<Plus className="w-4 h-4 stroke-[3]" />}>
              Report Issue
            </Button>
          </Link>
          <Link href="/complaints">
            <Button size="small" variant="outlined" startIcon={<ListFilter className="w-4 h-4" />}>
              Catalog Feed
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Main Map Body */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, position: 'relative', overflow: 'hidden' }}>
        {/* Sidebar Filters */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 320 },
            backgroundColor: '#121215',
            borderColor: '#27272a',
            borderRadius: 0,
            borderRight: { md: '1px solid #27272a' },
            borderBottom: { xs: '1px solid #27272a', md: 'none' },
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            overflowY: 'auto',
            zIndex: 20,
            maxHeight: { xs: '35vh', md: '100%' },
          }}
        >
          <TextField
            size="small"
            placeholder="Search address, ID..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-4 h-4 text-zinc-400" />
                </InputAdornment>
              ),
            }}
          />

          <Box>
            <Typography variant="overline" sx={{ color: '#a1a1aa', fontWeight: 800, mb: 1, display: 'block' }}>
              Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat })}
                  className={`text-[11px] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider transition-colors border ${
                    filters.category === cat
                      ? 'bg-zinc-100 text-zinc-950 border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: '#a1a1aa', fontWeight: 800, mb: 1, display: 'block' }}>
              Severity Level
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilters({ ...filters, severity: sev })}
                  className={`text-[11px] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider transition-colors border ${
                    filters.severity === sev
                      ? 'bg-zinc-100 text-zinc-950 border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: '#a1a1aa', fontWeight: 800, mb: 1, display: 'block' }}>
              Lifecycle Status
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              value={filters.status || 'ALL'}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as ComplaintStatus | 'ALL' })
              }
            >
              {statuses.map((st) => (
                <MenuItem key={st} value={st}>
                  {st === 'ALL' ? 'All Lifecycle Statuses' : st.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Paper>

        {/* Map View */}
        <Box sx={{ flex: 1, position: 'relative', height: '100%' }}>
          {loading ? (
            <LoadingState message="Initializing geospatial map..." height="h-full" />
          ) : (
            <MapView
              complaints={complaints}
              selectedComplaintId={selectedComplaint?.id}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              className="w-full h-full border-none rounded-none"
            />
          )}

          {/* Selected Card Drawer */}
          {selectedComplaint && (
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                bottom: 24,
                right: 24,
                left: { xs: 24, md: 'auto' },
                width: { md: 360 },
                zIndex: 30,
                backgroundColor: '#121215',
                borderColor: '#27272a',
                p: 3,
                borderRadius: '2px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CategoryBadge category={selectedComplaint.category} size="small" />
                  <SeverityBadge severity={selectedComplaint.severity} size="small" />
                </Box>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', mb: 0.5 }}>
                {selectedComplaint.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#71717a', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                {selectedComplaint.id}
              </Typography>

              <Typography variant="body2" sx={{ color: '#a1a1aa', fontSize: '0.8125rem', mb: 2 }}>
                {selectedComplaint.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', pt: 2, borderTop: '1px solid #27272a' }}>
                <StatusBadge status={selectedComplaint.status} size="small" />
                <Link href={`/complaints/${selectedComplaint.id}`}>
                  <Button size="small" variant="contained" endIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Dossier
                  </Button>
                </Link>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
