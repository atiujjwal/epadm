import Link from 'next/link';
import { footerNav, appUrls } from '@/config/site';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="py-16 bg-[var(--bg-base)]" role="contentinfo">
      <div className="mx-auto w-full max-w-[90rem] px-[var(--gutter-xs)] sm:px-[var(--gutter-sm)] md:px-[var(--gutter-md)] lg:px-[var(--gutter-lg)] xl:px-[var(--gutter-xl)]">
        {/* Top divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />

        {/* Main footer grid */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline" aria-label="EPADM — home">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="4" y="6"  width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
                <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="var(--accent-primary)" />
                <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
                <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="var(--accent-primary)" />
                <circle cx="24" cy="24" r="4" fill="var(--color-indigo-300)" opacity="0.7" />
                <circle cx="24" cy="24" r="2" fill="var(--accent-primary)" />
              </svg>
              <span className="text-lg font-bold text-[var(--text-primary)]">EPADM</span>
            </Link>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[32ch] m-0">
              AI-driven school management platform compliance-engineered for Indian K-12 private schools.
            </p>

            {/* Status indicator */}
            <a
              href={appUrls.status}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors"
              aria-label="Platform status — all systems operational"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-success-500)] shadow-[0_0_0_3px_rgba(16,185,129,0.2)] animate-[pulse-dot_2s_ease-in-out_infinite]" aria-hidden="true" />
              <span>All systems operational</span>
            </a>
          </div>

          {/* Nav columns */}
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8" aria-label="Footer navigation">
            {footerNav.map((column) => (
              <div key={column.heading} className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] m-0">{column.heading}</h3>
                <ul className="flex flex-col gap-2.5 list-none p-0 m-0" role="list">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent-primary)] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)] m-0">
            &copy; {currentYear} EPADM. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <Link href="/legal/privacy" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/legal/terms" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/legal/cookies" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-primary)] transition-colors">Cookies</Link>
            <span aria-hidden="true">·</span>
            <Link href="/legal/accessibility" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-primary)] transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
