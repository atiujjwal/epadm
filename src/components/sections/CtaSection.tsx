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
    </section>
  );
}
