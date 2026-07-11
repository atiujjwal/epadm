import Link from 'next/link';
import { footerNav, siteConfig, appUrls } from '@/config/site';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        {/* Top divider */}
        <div className="divider divider--gradient" />

        {/* Main footer grid */}
        <div className="footer__grid">
          {/* Brand column */}
          <div className="footer__brand">
            <Link href="/" className="footer__logo" aria-label="EPADM — home">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="4" y="6"  width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
                <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="var(--accent-primary)" />
                <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
                <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="var(--accent-primary)" />
                <circle cx="24" cy="24" r="4" fill="var(--color-indigo-300)" opacity="0.7" />
                <circle cx="24" cy="24" r="2" fill="var(--accent-primary)" />
              </svg>
              <span className="footer__logo-text">EPADM</span>
            </Link>

            <p className="footer__tagline">
              AI-driven school management platform compliance-engineered for Indian K-12 private schools.
            </p>

            {/* Status indicator */}
            <a
              href={appUrls.status}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__status"
              aria-label="Platform status — all systems operational"
            >
              <span className="status-dot status-dot--live" aria-hidden="true" />
              <span>All systems operational</span>
            </a>
          </div>

          {/* Nav columns */}
          <nav className="footer__nav-grid" aria-label="Footer navigation">
            {footerNav.map((column) => (
              <div key={column.heading} className="footer__column">
                <h3 className="footer__column-heading">{column.heading}</h3>
                <ul className="footer__column-list" role="list">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="footer__link">
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
        <div className="footer__bottom">
          <p className="footer__legal">
            &copy; {currentYear} EPADM. All rights reserved.
          </p>
          <div className="footer__legal-links">
            <Link href="/legal/privacy" className="footer__legal-link">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/legal/terms" className="footer__legal-link">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/legal/cookies" className="footer__legal-link">Cookies</Link>
            <span aria-hidden="true">·</span>
            <Link href="/legal/accessibility" className="footer__legal-link">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}