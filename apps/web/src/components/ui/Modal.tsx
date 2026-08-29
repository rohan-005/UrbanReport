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
        { scale: 0.98, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }
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
          borderColor: '#e2dfd7',
          borderRadius: '8px',
          p: 0.5,
          boxShadow: '0 8px 30px rgba(31,36,29,0.08)',
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
            px: 2.5,
            py: 2,
            borderBottom: '1px solid #e2dfd7',
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontFamily: 'var(--font-display), Lora, Georgia, serif',
              fontWeight: 700,
              color: '#1f241d',
              fontSize: '1.25rem',
            }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#877b5f',
              '&:hover': { backgroundColor: '#f5f3ee', color: '#1f241d' },
            }}
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, pt: 2.5 }}>
          {children}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

