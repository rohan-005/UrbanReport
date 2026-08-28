import React from 'react';
import { ComplaintFilters as IComplaintFilters, Category, Severity, ComplaintStatus } from '@/lib/types';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from 'lucide-react';

interface ComplaintFiltersProps {
  filters: IComplaintFilters;
  onChange: (filters: IComplaintFilters) => void;
  onReset: () => void;
}

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
  'REJECTED',
];

export const ComplaintFiltersBar: React.FC<ComplaintFiltersProps> = ({
  filters,
  onChange,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        backgroundColor: '#121215',
        borderColor: '#27272a',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2 }}>
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search title, ID, address..."
          value={filters.searchQuery || ''}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="w-4 h-4 text-zinc-400" />
              </InputAdornment>
            ),
          }}
        />

        {/* Category */}
        <TextField
          select
          size="small"
          value={filters.category || 'ALL'}
          onChange={(e) => onChange({ ...filters, category: e.target.value as Category | 'ALL' })}
        >
          <MenuItem value="ALL">All Categories</MenuItem>
          {categories.filter((c) => c !== 'ALL').map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        {/* Severity */}
        <TextField
          select
          size="small"
          value={filters.severity || 'ALL'}
          onChange={(e) => onChange({ ...filters, severity: e.target.value as Severity | 'ALL' })}
        >
          <MenuItem value="ALL">All Severities</MenuItem>
          {severities.filter((s) => s !== 'ALL').map((sev) => (
            <MenuItem key={sev} value={sev}>
              {sev} Severity
            </MenuItem>
          ))}
        </TextField>

        {/* Sort */}
        <TextField
          select
          size="small"
          value={filters.sortBy || 'newest'}
          onChange={(e) =>
            onChange({
              ...filters,
              sortBy: e.target.value as 'newest' | 'oldest' | 'upvotes' | 'severity',
            })
          }
        >
          <MenuItem value="newest">Sort: Newest</MenuItem>
          <MenuItem value="oldest">Sort: Oldest</MenuItem>
          <MenuItem value="upvotes">Sort: Upvotes</MenuItem>
          <MenuItem value="severity">Sort: Severity</MenuItem>
        </TextField>
      </Box>

      {/* Category Quick Select Pills */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pt: 1, borderTop: '1px solid #27272a' }}>
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          Quick Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange({ ...filters, category: cat })}
            className={`text-xs px-2.5 py-1 rounded-none uppercase font-bold tracking-wider whitespace-nowrap transition-colors border ${
              filters.category === cat
                ? 'bg-zinc-100 text-zinc-950 border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {cat === 'ALL' ? 'All Issues' : cat}
          </button>
        ))}
      </Box>
    </Paper>
  );
};
