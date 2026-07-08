/**
 * EPADM Motion Library
 *
 * Centralized Framer Motion variants to ensure consistent animation language
 * across the entire site. Import these rather than defining inline variants.
 *
 * Principles:
 * - All durations in the 120ms–600ms range
 * - Entrance animations use ease-out curves (content coming into view)
 * - Exit animations use ease-in curves (content leaving)
 * - Stagger children by 60-80ms for groups of 4–8 items
 * - Prefer opacity + translateY for text, opacity + scale for cards
 * - MotionConfig reducedMotion="user" is set globally in Providers.tsx
 */

import type { Variants } from 'framer-motion';

/* ── Easings ─────────────────────────────────────────────── */
export const easings = {
  default:  [0.4,  0, 0.2, 1]  as [number, number, number, number],
  smooth:   [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  spring:   { type: 'spring' as const, stiffness: 300, damping: 30 },
  springFirm: { type: 'spring' as const, stiffness: 400, damping: 38 },
  entry:    [0,    0, 0.2, 1]  as [number, number, number, number],
  exit:     [0.4,  0, 1, 1]   as [number, number, number, number],
} as const;

/* ── Fade Up — hero text, section headings ───────────────── */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: easings.exit },
  },
};

/* ── Fade In — subtle content reveals ───────────────────── */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: easings.default },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/* ── Fade Up Subtle — for secondary text, captions ──────── */
export const fadeUpSubtle: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.smooth },
  },
};

/* ── Scale In — modals, dropdowns, popups ───────────────── */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: easings.exit },
  },
};

/* ── Slide In From Right — drawer, panels ───────────────── */
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easings.springFirm,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2, ease: easings.exit },
  },
};

/* ── Slide In From Left ──────────────────────────────────── */
export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easings.springFirm,
  },
};

/* ── Card Hover (use with whileHover) ───────────────────── */
export const cardHover = {
  scale: 1.015,
  transition: { duration: 0.22, ease: easings.smooth },
};

/* ── Container — for staggered children ─────────────────── */
export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

/* ── Stagger Container — faster ─────────────────────────── */
export const staggerContainerFast: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

/* ── Stagger Container — slower ─────────────────────────── */
export const staggerContainerSlow: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

/* ── Hero — orchestrated sequence ───────────────────────── */
export const heroContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const heroEyebrow: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.smooth },
  },
};

export const heroHeading: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easings.smooth },
  },
};

export const heroSubtitle: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easings.smooth },
  },
};

export const heroCta: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.smooth },
  },
};

export const heroVisual: Variants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: easings.smooth, delay: 0.3 },
  },
};

/* ── Viewport trigger — use on section wrapper ───────────── */
export const viewportConfig = {
  once: true,
  amount: 0.15,
} as const;

/* ── Number counter — for stats ─────────────────────────── */
export const numberReveal: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easings.smooth },
  },
};

/* ── Tab content transition ──────────────────────────────── */
export const tabContent: Variants = {
  hidden:  { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    x: 8,
    transition: { duration: 0.18, ease: easings.exit },
  },
};

/* ── Accordion content ──────────────────────────────────── */
export const accordionContent: Variants = {
  hidden:  { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: easings.smooth },
      opacity: { duration: 0.2, delay: 0.05 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.25, ease: easings.exit },
      opacity: { duration: 0.15 },
    },
  },
};

/* ── Toast / Notification ───────────────────────────────── */
export const toastEnter: Variants = {
  hidden:  { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.2, ease: easings.exit },
  },
};

/* ── Line draw — for SVG paths ──────────────────────────── */
export const drawLine: Variants = {
  hidden:  { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.2, ease: 'easeInOut' }, opacity: { duration: 0.1 } },
  },
};

/* ── Glow pulse — background accent animation ───────────── */
export const glowPulse: Variants = {
  initial: { opacity: 0.4, scale: 1 },
  animate: {
    opacity: [0.4, 0.65, 0.4],
    scale:   [1, 1.04, 1],
    transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
  },
};
