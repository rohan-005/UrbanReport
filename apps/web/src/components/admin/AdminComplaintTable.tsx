import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowRight, MapPin, Building2, Calendar } from 'lucide-react';

interface AdminComplaintTableProps {
  complaints: Complaint[];
}

export const AdminComplaintTable: React.FC<AdminComplaintTableProps> = ({ complaints }) => {
  return (
    <Box>
      {/* MOBILE & TABLET CARD VIEW (visible on xs and sm) */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {complaints.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#ffffff',
              borderColor: '#e2dfd7',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1f241d', px: 1.25, py: 0.25, backgroundColor: '#f5f3ee', border: '1px solid #e2dfd7', borderRadius: '9999px' }}>
                {item.id}
              </Typography>
              <StatusBadge status={item.status} size="small" />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f241d', mb: 0.5, lineHeight: 1.3 }}>
                {item.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280', fontSize: '0.75rem' }}>
                <MapPin className="w-3.5 h-3.5 text-[#877b5f] shrink-0" />
                <span className="truncate">{item.address}</span>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <CategoryBadge category={item.category} size="small" />
              <SeverityBadge severity={item.severity} size="small" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e2dfd7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6b7280', fontSize: '0.75rem' }}>
                {item.assignment ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Building2 className="w-3.5 h-3.5 text-[#877b5f] shrink-0" />
                    <span className="truncate max-w-[150px] font-semibold text-[#1f241d]">{item.assignment.department}</span>
                  </Box>
                ) : (
                  <span className="text-zinc-400 italic">Unassigned</span>
                )}
              </Box>

              <Link href={`/admin/complaints/${item.id}`}>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  sx={{ backgroundColor: '#89a577', color: '#ffffff', fontWeight: 700, fontSize: '0.6875rem', borderRadius: '8px', '&:hover': { backgroundColor: '#6e895d' } }}
                >
                  Triage / Action
                </Button>
              </Link>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* DESKTOP TABLE VIEW (visible on md and up) */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ display: { xs: 'none', md: 'block' }, backgroundColor: '#ffffff', borderColor: '#e2dfd7', borderRadius: '8px', overflow: 'hidden' }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="admin complaint queue table">
          <TableHead sx={{ backgroundColor: '#f5f3ee' }}>
            <TableRow>
              <TableCell sx={{ color: '#1f241d', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>ID</TableCell>
              <TableCell sx={{ color: '#1f241d', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Title & Address</TableCell>
              <TableCell sx={{ color: '#1f241d', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Category</TableCell>
              <TableCell sx={{ color: '#1f241d', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Severity</TableCell>
              <TableCell sx={{ color: '#1f241d', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Status</TableCell>
              <TableCell sx={{ color: '#1f241d', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Department</TableCell>
              <TableCell align="right" sx={{ color: '#1f241d', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((item) => (
              <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f3ee/50' } }}>
                <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1f241d', fontSize: '0.75rem' }}>
                  {item.id}
                </TableCell>

                <TableCell sx={{ maxWidth: 260 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1f241d', fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280', fontSize: '0.75rem', mt: 0.25 }}>
                    <MapPin className="w-3 h-3 text-[#877b5f] shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </Box>
                </TableCell>

                <TableCell>
                  <CategoryBadge category={item.category} size="small" />
                </TableCell>

                <TableCell>
                  <SeverityBadge severity={item.severity} size="small" />
                </TableCell>

                <TableCell>
                  <StatusBadge status={item.status} size="small" />
                </TableCell>

                <TableCell sx={{ fontSize: '0.75rem', color: '#1f241d', fontWeight: 600 }}>
                  {item.assignment ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Building2 className="w-3.5 h-3.5 text-[#877b5f] shrink-0" />
                      <span className="truncate max-w-[140px]">{item.assignment.department}</span>
                    </Box>
                  ) : (
                    <span className="text-zinc-400 italic">Unassigned</span>
                  )}
                </TableCell>

                <TableCell align="right">
                  <Link
                    href={`/admin/complaints/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white px-3 py-1 rounded-md bg-[#89a577] border border-[#89a577] hover:bg-[#6e895d] transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577]"
                  >
                    <span>ACTION</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

