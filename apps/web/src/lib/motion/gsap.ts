'use client';

import gsap from 'gsap';

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animatePageEntrance(target: string | HTMLElement) {
  if (isReducedMotion()) return;
  gsap.fromTo(
    target,
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.08 }
  );
}

export function animateHeroTitle(target: string | HTMLElement) {
  if (isReducedMotion()) return;
  gsap.fromTo(
    target,
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
  );
}

export function animateTimelineNodes(targets: string) {
  if (isReducedMotion()) return;
  gsap.fromTo(
    targets,
    { opacity: 0, x: -15 },
    { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.1 }
  );
}
