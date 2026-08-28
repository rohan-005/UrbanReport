'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { isReducedMotion } from '@/lib/motion/gsap';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReducedMotion() || !elementRef.current) return;

    let initialX = 0;
    let initialY = 0;

    if (direction === 'up') initialY = 20;
    if (direction === 'down') initialY = -20;
    if (direction === 'left') initialX = 20;
    if (direction === 'right') initialX = -20;

    gsap.fromTo(
      elementRef.current,
      { opacity: 0, x: initialX, y: initialY },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.5,
        delay: delay,
        ease: 'power3.out',
      }
    );
  }, [delay, direction]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};
