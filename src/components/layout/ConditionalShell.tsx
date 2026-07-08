'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * ConditionalShell
 *
 * Wraps children with the public marketing Navigation + Footer on routes
 * that need them. Admin routes (/admin/*) render without any marketing
 * chrome — the admin layout provides its own sidebar/nav.
 */

interface ConditionalShellProps {
  navigation: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/** Route prefixes that should NOT show the public marketing header/footer */
const SHELL_EXCLUDED_PREFIXES = ['/admin'];

export function ConditionalShell({
  navigation,
  footer,
  children,
}: ConditionalShellProps) {
  const pathname = usePathname();
  const showShell = !SHELL_EXCLUDED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!showShell) {
    return (
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    );
  }

  return (
    <>
      {navigation}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      {footer}
    </>
  );
}
