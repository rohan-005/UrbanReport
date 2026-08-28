'use client';

import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import gsap from 'gsap';
import { isReducedMotion } from '@/lib/motion/gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, []);

  return (
    <Box ref={containerRef} sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </Box>
  );
};
