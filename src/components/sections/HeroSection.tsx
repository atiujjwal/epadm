'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import {
  heroContainer, heroEyebrow, heroHeading,
  heroSubtitle, heroCta, heroVisual,
} from '@/lib/motion';
import { ctaNav, appUrls } from '@/config/site';
import { TopologyGrid } from '@/components/ui/TopologyGrid';

export function HeroSection() {
  return (
    <section className="hero" aria-label="EPADM hero">
      {/* Radial background glow */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow hero__glow--1" />
        <div className="hero__glow hero__glow--2" />
        <div className="hero__grid-lines" />
      </div>

      <div className="container hero__container">
        {/* Copy column */}
        <m.div
          className="hero__copy"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <m.div variants={heroEyebrow} className="hero__eyebrow">
            <span className="badge badge--accent">
              <span className="status-dot status-dot--live" aria-hidden="true" />
              Enterprise Administration Platform
            </span>
          </m.div>

          {/* Heading */}
          <m.h1 variants={heroHeading} className="hero__heading">
            Control every tenant.
            <br />
            <span className="text-gradient">Govern everything.</span>
          </m.h1>

          {/* Subtitle */}
          <m.p variants={heroSubtitle} className="hero__subtitle">
            EPADM is the enterprise control plane that gives platform teams unified
            authority over multi-tenant administration, data governance, and access
            policy — at any scale.
          </m.p>

          {/* CTAs */}
          <m.div variants={heroCta} className="hero__ctas">
            <Link href={ctaNav.primary.href} className="btn btn--primary btn--lg">
              {ctaNav.primary.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/platform" className="btn btn--secondary btn--lg">
              Explore the platform
            </Link>
          </m.div>

          {/* Trust row */}
          <m.div variants={heroCta} className="hero__trust">
            <div className="hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Multi-tenant by design</span>
            </div>
            <div className="hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Role-based access control</span>
            </div>
            <div className="hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Audit-ready governance</span>
            </div>
          </m.div>

          {/* Existing user sign-in link */}
          <m.div variants={heroCta}>
            <Link href={appUrls.tenantLogin} className="hero__signin-link">
              Existing tenant?
              <span>Sign in to your workspace</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </m.div>
        </m.div>

        {/* Visual column — Topology Grid */}
        <m.div
          className="hero__visual"
          variants={heroVisual}
          initial="hidden"
          animate="visible"
        >
          <div className="hero__visual-card">
            <div className="hero__visual-header">
              <div className="hero__visual-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="hero__visual-title">EPADM Control Plane</span>
              <span className="badge badge--success">
                <span className="status-dot status-dot--live" aria-hidden="true" />
                Live
              </span>
            </div>
            <div className="hero__visual-body">
              <TopologyGrid />
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
