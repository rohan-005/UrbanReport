'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintFilters, Category, Severity, ComplaintStatus } from '@/lib/types';
import { MapView, MapBounds } from '@/components/map/MapView';
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
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [viewportBounds, setViewportBounds] = useState<MapBounds | null>(null);

  const [filters, setFilters] = useState<ComplaintFilters>({
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    searchQuery: '',
  });

  const loadData = useCallback(async (bounds: MapBounds | null, currentFilters: ComplaintFilters) => {
    setLoading(true);
    let data: Complaint[] = [];
    if (bounds) {
      data = await complaintRepository.getViewportComplaints(bounds, currentFilters);
    } else {
      data = await complaintRepository.getAllComplaints(currentFilters);
    }

    if (currentFilters.searchQuery?.trim()) {
      const q = currentFilters.searchQuery.toLowerCase().trim();
      data = data.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    setComplaints(data);
    setLoading(false);
  }, []);

  const handleViewportChange = useCallback((bounds: MapBounds) => {
    setViewportBounds(bounds);
    loadData(bounds, filters);
  }, [filters, loadData]);

  useEffect(() => {
    loadData(viewportBounds, filters);
    const unsubscribe = complaintRepository.subscribe(() => loadData(viewportBounds, filters));
    return () => unsubscribe();
  }, [filters, viewportBounds, loadData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0rem)', backgroundColor: '#f5f3ee', pb: 10 }}>
      {/* Header Controls */}
      <Box sx={{ borderBottom: '1px solid #e2e0d8', px: 3, py: 2, backgroundColor: '#ffffff', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MapPin className="w-5 h-5 text-zinc-950" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#09090b', lineHeight: 1.2 }}>
              Geospatial Complaint Map
            </Typography>
            <Typography variant="caption" sx={{ color: '#52525b' }}>
              Showing <span className="font-bold text-zinc-950">{complaints.length}</span> active PostGIS viewport incident records
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
            backgroundColor: '#ffffff',
            borderColor: '#e2e0d8',
            borderRadius: 0,
            borderRight: { md: '1px solid #e2e0d8' },
            borderBottom: { xs: '1px solid #e2e0d8', md: 'none' },
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
                  <Search className="w-4 h-4 text-zinc-500" />
                </InputAdornment>
              ),
            }}
          />

          <Box>
            <Typography variant="overline" sx={{ color: '#09090b', fontWeight: 900, mb: 1, display: 'block' }}>
              Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat })}
                  className={`text-[11px] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider transition-colors border ${
                    filters.category === cat
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:text-zinc-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: '#09090b', fontWeight: 900, mb: 1, display: 'block' }}>
              Severity Level
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilters({ ...filters, severity: sev })}
                  className={`text-[11px] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider transition-colors border ${
                    filters.severity === sev
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:text-zinc-950'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: '#09090b', fontWeight: 900, mb: 1, display: 'block' }}>
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
          <MapView
            complaints={complaints}
            selectedComplaintId={selectedComplaint?.id}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onViewportChange={handleViewportChange}
            isLoading={loading}
            className="w-full h-full border-none rounded-none"
          />

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
                backgroundColor: '#ffffff',
                borderColor: '#e2e0d8',
                p: 3,
                borderRadius: '2px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CategoryBadge category={selectedComplaint.category} size="small" />
                  <SeverityBadge severity={selectedComplaint.severity} size="small" />
                </Box>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded text-zinc-500 hover:text-black hover:bg-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#09090b', fontSize: '1rem', mb: 0.5 }}>
                {selectedComplaint.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#52525b', fontFamily: 'monospace', display: 'block', mb: 1, fontWeight: 700 }}>
                {selectedComplaint.id}
              </Typography>

              <Typography variant="body2" sx={{ color: '#52525b', fontSize: '0.8125rem', mb: 2 }}>
                {selectedComplaint.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', pt: 2, borderTop: '1px solid #e2e0d8' }}>
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
