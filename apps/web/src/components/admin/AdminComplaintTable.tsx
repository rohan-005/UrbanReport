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
import { ArrowRight, MapPin, Building2 } from 'lucide-react';

interface AdminComplaintTableProps {
  complaints: Complaint[];
}

export const AdminComplaintTable: React.FC<AdminComplaintTableProps> = ({ complaints }) => {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px' }}>
      <Table sx={{ minWidth: 650 }} aria-label="admin complaint queue table">
        <TableHead sx={{ backgroundColor: '#09090b' }}>
          <TableRow>
            <TableCell sx={{ color: '#a1a1aa', fontWeight: 800, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>ID</TableCell>
            <TableCell sx={{ color: '#a1a1aa', fontWeight: 800, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Title & Address</TableCell>
            <TableCell sx={{ color: '#a1a1aa', fontWeight: 800, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Category</TableCell>
            <TableCell sx={{ color: '#a1a1aa', fontWeight: 800, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Severity</TableCell>
            <TableCell sx={{ color: '#a1a1aa', fontWeight: 800, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</TableCell>
            <TableCell sx={{ color: '#a1a1aa', fontWeight: 800, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Department</TableCell>
            <TableCell align="right" sx={{ color: '#a1a1aa', fontWeight: 800, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {complaints.map((item) => (
            <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#18181b' } }}>
              <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc', fontSize: '0.75rem' }}>
                {item.id}
              </TableCell>

              <TableCell sx={{ maxWidth: 260 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#a1a1aa', fontSize: '0.75rem', mt: 0.25 }}>
                  <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
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

              <TableCell sx={{ fontSize: '0.75rem', color: '#e4e4e7' }}>
                {item.assignment ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{item.assignment.department}</span>
                  </Box>
                ) : (
                  <span className="text-zinc-500 italic">Unassigned</span>
                )}
              </TableCell>

              <TableCell align="right">
                <Link
                  href={`/admin/complaints/${item.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-100 hover:text-white px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors"
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
  );
};
