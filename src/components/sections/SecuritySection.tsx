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
    <section className="section security" aria-labelledby="security-heading">
      {/* Accent background */}
      <div className="security__bg" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <m.div
          className="section-header section-header--center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="section-header__eyebrow" style={{ justifyContent: 'center' }}>
            Security & governance
          </p>
          <h2 className="section-header__title" id="security-heading">
            Security is the architecture, not the afterthought
          </h2>
          <p className="section-header__subtitle">
            EPADM's security model is designed from the ground up for multi-tenant
            enterprise environments where isolation, auditability, and least-privilege
            are non-negotiable.
          </p>
        </m.div>

        {/* Security pillars */}
        <m.div
          className="security__grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {securityPillars.map((pillar) => (
            <m.article
              key={pillar.title}
              className="security__card"
              variants={fadeUp}
            >
              <div className="security__card-icon" aria-hidden="true">
                {pillar.icon}
              </div>
              <div>
                <h3 className="security__card-title">{pillar.title}</h3>
                <p className="security__card-body">{pillar.body}</p>
              </div>
            </m.article>
          ))}
        </m.div>

        {/* Trust indicators row */}
        <m.div
          className="security__trust"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="security__trust-label">Platform security guarantees</p>
          <div className="security__trust-grid">
            {trustIndicators.map((indicator) => (
              <div key={indicator.label} className="security__trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <div>
                  <span className="security__trust-item-label">{indicator.label}</span>
                  <span className="security__trust-item-desc">{indicator.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
