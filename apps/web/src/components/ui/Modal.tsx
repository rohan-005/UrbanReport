'use client';

import React, { useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { isReducedMotion } from '@/lib/motion/gsap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isReducedMotion() && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e0d8',
          borderRadius: '2px',
          p: 1,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box ref={contentRef}>
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            borderBottom: '1px solid #e2e0d8',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 900, color: '#09090b', fontSize: '1.125rem' }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#52525b' }} aria-label="Close dialog">
            <X className="w-4 h-4" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {children}
        </DialogContent>
      </Box>
    </Dialog>
  );
};
