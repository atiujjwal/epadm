'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * ConditionalShell
 *
 * Wraps children with the public marketing Navigation + Footer on marketing
 * routes only. The authenticated application (tenant workspace and the ops
 * control plane) has its own shell — sidebar + app header — and must never
 * show the marketing chrome, otherwise the product reads as a website rather
 * than an app.
 *
 * Routing note: the tenant workspace is served by a proxy *rewrite*
 * (see `src/proxy.ts`), so the browser URL stays clean (`/dashboard`,
 * `/users`, …) even though the underlying route is `/root/{tenant}/…`.
 * `usePathname()` returns that visible URL, which is why the exclusion list
 * matches the clean app paths rather than the `/root/*` rewrite target.
 */

interface ConditionalShellProps {
  navigation: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/**
 * Route prefixes that render inside the authenticated application shell and must
 * NOT show the public marketing header/footer. Single source of truth — add new
 * top-level app sections here. Anything not matched is treated as a
 * marketing/legal page and keeps the marketing chrome.
 *
 * Matching is segment-precise (exact, or followed by `/`) so a marketing route
 * can never be swallowed by a sibling that merely shares a prefix.
 */
const APP_SHELL_PREFIXES = [
  '/admin', // ops control plane (own layout)
  '/admin-dashboard', // tenant admin home
  '/dashboard',
  '/users',
  '/students',
  '/student', // student portal
  '/staff',
  '/academics',
  '/finance',
  '/teacher', // teacher portal
];

function isAppShellRoute(pathname: string): boolean {
  return APP_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );
}

export function ConditionalShell({
  navigation,
  footer,
  children,
}: ConditionalShellProps) {
  const pathname = usePathname();
  const showShell = !isAppShellRoute(pathname);

  // App-shell routes own their layout, including the single <main id="main-content">
  // (a sibling of the sidebar <nav>). Do not wrap them here — a second <main>
  // would nest, which is invalid HTML and breaks the skip-link target.
  if (!showShell) {
    return <>{children}</>;
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
