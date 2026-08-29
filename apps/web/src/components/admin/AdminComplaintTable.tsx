'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { Modal } from '../ui/Modal';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
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
import Alert from '@mui/material/Alert';
import { ArrowRight, MapPin, Building2, Trash2 } from 'lucide-react';

interface AdminComplaintTableProps {
  complaints: Complaint[];
  onDeleted?: () => void;
}

export const AdminComplaintTable: React.FC<AdminComplaintTableProps> = ({ complaints, onDeleted }) => {
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const success = await complaintRepository.deleteComplaint(deleteTarget.id);
      if (success) {
        setDeleteTarget(null);
        if (onDeleted) onDeleted();
      } else {
        setDeleteError('Failed to delete complaint record.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error occurred while deleting complaint.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      {/* MOBILE & TABLET CARD VIEW (visible on xs and sm) */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {complaints.map((item) => {
          const isAssignedAndDone = Boolean(item.assignment) && item.status === 'RESOLVED';
          return (
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isAssignedAndDone && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => setDeleteTarget(item)}
                      startIcon={<Trash2 className="w-3.5 h-3.5" />}
                      sx={{ fontWeight: 700, fontSize: '0.6875rem', borderRadius: '8px' }}
                    >
                      Delete
                    </Button>
                  )}
                  <Link href={`/admin/complaints/${item.id}`}>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      sx={{ backgroundColor: '#89a577', color: '#ffffff', fontWeight: 700, fontSize: '0.6875rem', borderRadius: '8px', '&:hover': { backgroundColor: '#6e895d' } }}
                    >
                      Action
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Paper>
          );
        })}
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
            {complaints.map((item) => {
              const isAssignedAndDone = Boolean(item.assignment) && item.status === 'RESOLVED';
              return (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {isAssignedAndDone && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setDeleteTarget(item)}
                          startIcon={<Trash2 className="w-3.5 h-3.5" />}
                          sx={{ fontWeight: 700, fontSize: '0.6875rem', borderRadius: '8px' }}
                        >
                          DELETE
                        </Button>
                      )}
                      <Link
                        href={`/admin/complaints/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white px-3 py-1 rounded-md bg-[#89a577] border border-[#89a577] hover:bg-[#6e895d] transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577]"
                      >
                        <span>ACTION</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CONFIRMATION DELETE MODAL */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Completed Department Work"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {deleteError && (
            <Alert severity="error" sx={{ borderRadius: '8px' }}>
              {deleteError}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: '#4b5563' }}>
            Are you sure you want to delete this completed work entry for <strong>{deleteTarget?.assignment?.department || 'Department Work'}</strong>?
          </Typography>

          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, display: 'block', color: '#374151' }}>
              ID: {deleteTarget?.id}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mt: 0.5 }}>
              {deleteTarget?.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5 }}>
              Department: {deleteTarget?.assignment?.department}
            </Typography>
          </Paper>

          <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
            Warning: This action will permanently remove this completed incident record from the administrative database.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <Button variant="outlined" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              startIcon={<Trash2 className="w-4 h-4" />}
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};
