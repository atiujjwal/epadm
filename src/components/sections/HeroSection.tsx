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

      <style>{`
        .hero {
          position: relative;
          min-height: calc(100vh - var(--nav-height));
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-block: clamp(4rem, 8vw, 8rem);
        }

        /* Background */
        .hero__bg { position: absolute; inset: 0; z-index: var(--z-behind); }

        .hero__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .hero__glow--1 {
          width: clamp(400px, 50vw, 700px);
          height: clamp(400px, 50vw, 700px);
          background: radial-gradient(circle, rgba(79, 110, 247, 0.18) 0%, transparent 70%);
          top: -10%;
          right: -5%;
        }

        .hero__glow--2 {
          width: clamp(300px, 35vw, 500px);
          height: clamp(300px, 35vw, 500px);
          background: radial-gradient(circle, rgba(79, 110, 247, 0.08) 0%, transparent 70%);
          bottom: 5%;
          left: 10%;
        }

        .hero__grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at 60% 40%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 60% 40%, black 30%, transparent 70%);
        }

        /* Layout */
        .hero__container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
          align-items: center;
          position: relative;
          z-index: 1;
        }

        /* Copy */
        .hero__copy {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .hero__eyebrow { display: flex; }

        .hero__heading {
          font-size: clamp(2.75rem, 5.5vw + 0.5rem, 5.25rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          line-height: var(--leading-tight);
          color: var(--text-primary);
          margin: 0;
        }

        .hero__subtitle {
          font-size: clamp(1rem, 1.5vw + 0.25rem, 1.25rem);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          max-width: 48ch;
          margin: 0;
        }

        .hero__ctas {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .hero__trust {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          flex-wrap: wrap;
        }

        .hero__trust-item {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--text-tertiary);
        }

        .hero__signin-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--text-muted);
          text-decoration: none;
          transition: color var(--duration-fast);
        }

        .hero__signin-link span {
          color: var(--accent-primary);
          font-weight: var(--weight-medium);
          text-decoration: underline;
          text-decoration-color: rgba(79, 110, 247, 0.4);
          text-underline-offset: 3px;
          transition: text-decoration-color var(--duration-fast);
        }

        .hero__signin-link:hover { color: var(--text-secondary); }
        .hero__signin-link:hover span { text-decoration-color: var(--accent-primary); }

        /* Visual */
        .hero__visual { display: flex; justify-content: flex-end; }

        .hero__visual-card {
          width: 100%;
          max-width: 36rem;
          background: rgba(15, 22, 41, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl), 0 0 60px rgba(79, 110, 247, 0.12);
        }

        .hero__visual-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          background: var(--color-white-04);
        }

        .hero__visual-dots {
          display: flex;
          gap: var(--space-1-5);
        }

        .hero__visual-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--border-default);
        }

        .hero__visual-dots span:nth-child(1) { background: rgba(239, 68, 68, 0.5); }
        .hero__visual-dots span:nth-child(2) { background: rgba(245, 158, 11, 0.5); }
        .hero__visual-dots span:nth-child(3) { background: rgba(16, 185, 129, 0.5); }

        .hero__visual-title {
          flex: 1;
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .hero__visual-body {
          padding: var(--space-5);
          aspect-ratio: 4/3;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero__container {
            grid-template-columns: 1fr;
            gap: var(--space-10);
          }
          .hero__visual { justify-content: center; }
          .hero__visual-card { max-width: 100%; }
        }

        @media (max-width: 640px) {
          .hero__heading { font-size: 2.5rem; }
          .hero__ctas { flex-direction: column; align-items: flex-start; }
          .hero__trust { gap: var(--space-3); }
        }
      `}</style>
    </section>
  );
}
