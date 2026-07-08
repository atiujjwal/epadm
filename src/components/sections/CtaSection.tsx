'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { viewportConfig } from '@/lib/motion';
import { ctaNav, appUrls } from '@/config/site';

export function CtaSection() {
  return (
    <section className="section--tight cta-section" aria-labelledby="cta-heading">
      <div className="container">
        <m.div
          className="cta-section__inner"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Background decoration */}
          <div className="cta-section__glow" aria-hidden="true" />
          <div className="cta-section__grid-pattern" aria-hidden="true" />

          {/* Content */}
          <div className="cta-section__content">
            <div className="badge badge--accent" style={{ alignSelf: 'center' }}>
              Ready when you are
            </div>

            <h2 className="cta-section__heading" id="cta-heading">
              See EPADM in your environment
            </h2>

            <p className="cta-section__body">
              Talk to the EPADM team about your platform architecture. We'll walk
              through how the control plane maps to your tenant model, access requirements,
              and data governance needs — with no pressure and no generic demo script.
            </p>

            {/* Primary CTA row */}
            <div className="cta-section__actions">
              <Link href={ctaNav.primary.href} className="btn btn--primary btn--xl">
                {ctaNav.primary.label}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/platform" className="btn btn--secondary btn--xl">
                Explore the platform
              </Link>
            </div>

            {/* Divider */}
            <div className="cta-section__divider" aria-hidden="true">
              <span />
              <span className="cta-section__divider-label">Already using EPADM?</span>
              <span />
            </div>

            {/* Secondary access row */}
            <div className="cta-section__access" style={{ justifyContent: 'center' }}>
              <Link href={appUrls.tenantLogin} className="cta-section__access-link" style={{ maxWidth: '24rem', margin: '0 auto' }}>
                <div className="cta-section__access-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                </div>
                <div>
                  <span className="cta-section__access-label">School login</span>
                  <span className="cta-section__access-desc">Access your school workspace</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </m.div>
      </div>

      <style>{`
        .cta-section {
          padding-bottom: var(--space-24);
        }

        .cta-section__inner {
          position: relative;
          padding: clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 5rem);
          background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-3xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-align: center;
        }

        .cta-section__glow {
          position: absolute;
          top: -40%;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 80%;
          background: radial-gradient(ellipse, rgba(79, 110, 247, 0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .cta-section__grid-pattern {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .cta-section__content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
          max-width: 44rem;
          margin: 0 auto;
          width: 100%;
        }

        .cta-section__heading {
          font-size: clamp(2rem, 3.5vw + 0.5rem, 3.25rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          color: var(--text-primary);
          margin: 0;
          line-height: var(--leading-tight);
        }

        .cta-section__body {
          font-size: clamp(1rem, 1.5vw, 1.125rem);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: 48ch;
        }

        .cta-section__actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
          justify-content: center;
        }

        .cta-section__divider {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          width: 100%;
          margin-block: var(--space-2);
        }

        .cta-section__divider span:not(.cta-section__divider-label) {
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .cta-section__divider-label {
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--text-muted);
          white-space: nowrap;
        }

        .cta-section__access {
          display: flex;
          gap: var(--space-4);
          width: 100%;
        }

        .cta-section__access-link {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          background: var(--bg-surface-2);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          text-decoration: none;
          text-align: left;
          transition:
            border-color var(--duration-fast),
            background var(--duration-fast),
            box-shadow var(--duration-fast);
        }

        .cta-section__access-link:hover {
          border-color: var(--border-accent);
          background: var(--accent-subtle);
          box-shadow: var(--shadow-glow-sm);
        }

        .cta-section__access-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .cta-section__access-link:hover .cta-section__access-icon {
          color: var(--accent-primary);
          border-color: var(--border-accent);
          background: var(--accent-subtle);
        }

        .cta-section__access-label {
          display: block;
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          line-height: 1.2;
        }

        .cta-section__access-desc {
          display: block;
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 2px;
        }

        @media (max-width: 640px) {
          .cta-section__actions { flex-direction: column; width: 100%; }
          .cta-section__actions .btn { width: 100%; }
          .cta-section__access { flex-direction: column; }
        }
      `}</style>
    </section>
  );
}
