'use client';

import { m } from 'framer-motion';
import { staggerContainer, fadeUp, viewportConfig } from '@/lib/motion';

const securityPillars = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Tenant Isolation',
    body: 'Strict namespace separation at every layer: configuration, data, credentials, and sessions. No cross-tenant data leakage by design.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: 'Encrypted at Rest & Transit',
    body: 'All data encrypted at rest using AES-256 and in transit via TLS 1.3. Key management configurable per deployment environment.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: 'Immutable Audit Logs',
    body: 'Every administrative action recorded with actor identity, timestamp, IP, and full context. Logs are append-only and exportable for compliance.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
    title: 'Least-Privilege by Default',
    body: 'New users and service accounts receive minimum permissions. Privilege escalation requires explicit approval and is logged to the audit trail.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: 'Anomaly Detection',
    body: 'Access pattern analysis identifies unusual behavior — off-hours logins, bulk data exports, permission escalation — and triggers configurable alerts.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'Secure API Surface',
    body: 'All API endpoints authenticated via signed tokens with configurable expiration. Rate limiting, input validation, and CSP headers enforced at the edge.',
  },
] as const;

const trustIndicators = [
  { label: 'TLS 1.3',          desc: 'Minimum transport security' },
  { label: 'AES-256',          desc: 'Encryption at rest' },
  { label: 'RBAC + ABAC',      desc: 'Access control models' },
  { label: 'SAML 2.0 / OIDC',  desc: 'Identity federation' },
  { label: 'Audit logs',        desc: 'Immutable event trail' },
  { label: 'Zero cross-tenant', desc: 'Strict isolation guarantee' },
] as const;

export function SecuritySection() {
  return (
    <section className="py-[var(--section-padding-y)] relative" aria-labelledby="security-heading">
      {/* Accent background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_center,var(--accent-subtle)_0%,transparent_70%)] opacity-40" />
      </div>

      <div className="mx-auto w-full max-w-[90rem] px-[var(--gutter-xs)] sm:px-[var(--gutter-sm)] md:px-[var(--gutter-md)] lg:px-[var(--gutter-lg)] xl:px-[var(--gutter-xl)] relative z-[1]">
        {/* Header */}
        <m.div
          className="flex flex-col gap-4 max-w-3xl items-center text-center mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-[var(--accent-primary)] flex items-center gap-2 justify-center">
            Security &amp; governance
          </p>
          <h2 className="m-0 text-[var(--text-primary)]" id="security-heading">
            Security is the architecture, not the afterthought
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-[52ch] m-0">
            EPADM&apos;s security model is designed from the ground up for multi-tenant
            enterprise environments where isolation, auditability, and least-privilege
            are non-negotiable.
          </p>
        </m.div>

        {/* Security pillars */}
        <m.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {securityPillars.map((pillar) => (
            <m.article
              key={pillar.title}
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 transition-all duration-200 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow-sm)] flex items-start gap-4"
              variants={fadeUp}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-subtle)] text-[var(--accent-primary)] shrink-0" aria-hidden="true">
                {pillar.icon}
              </div>
              <div>
                <h3 className="font-[var(--font-display)] text-xl font-semibold text-[var(--text-primary)] m-0 leading-snug">{pillar.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 mt-1">{pillar.body}</p>
              </div>
            </m.article>
          ))}
        </m.div>

        {/* Trust indicators row */}
        <m.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-4">Platform security guarantees</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustIndicators.map((indicator) => (
              <div key={indicator.label} className="flex items-start gap-2 text-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5" aria-hidden="true" className="shrink-0 mt-0.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <div>
                  <span className="block text-sm font-semibold text-[var(--text-primary)]">{indicator.label}</span>
                  <span className="block text-xs text-[var(--text-muted)]">{indicator.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
