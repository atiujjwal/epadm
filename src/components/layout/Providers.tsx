'use client';

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Global client-side providers.
 *
 * LazyMotion with domAnimation loads only the features needed,
 * keeping the motion bundle lean (~18KB vs ~34KB for domMax).
 *
 * MotionConfig propagates reducedMotion preference site-wide,
 * respecting the user's OS accessibility setting.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
