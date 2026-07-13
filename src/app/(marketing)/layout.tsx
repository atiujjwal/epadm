import type { ReactNode } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
