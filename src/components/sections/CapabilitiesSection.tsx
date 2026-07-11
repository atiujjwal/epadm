'use client';

import { m } from 'framer-motion';
import { staggerContainer, fadeUp, viewportConfig } from '@/lib/motion';

const capabilities = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Multi-Tenant Architecture',
    body: 'Full tenant isolation with shared infrastructure. Namespace-level separation of config, data, and credentials across every tenant.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Policy Enforcement Engine',
    body: 'Define governance rules once, enforce them everywhere. Policies apply automatically at provisioning, access, and data ingestion.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: 'Audit Trail & Compliance',
    body: 'Every action logged with actor, timestamp, and context. Immutable records exportable for compliance review and security audit.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
        <path d="M22 12a10 10 0 01-20 0" />
      </svg>
    ),
    title: 'SSO & Identity Federation',
    body: 'Integrate with Okta, Azure AD, Google Workspace, or any SAML 2.0 / OIDC-compatible identity provider at platform or per-tenant level.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Real-Time Observability',
    body: 'Monitor platform health, tenant activity, and data pipeline status from a live control-plane dashboard. Alert on anomalies automatically.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: 'Webhook & Event Streaming',
    body: 'Publish platform events to your existing observability stack, data warehouse, or business intelligence system via webhooks or streaming.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'CMS / Control Plane UI',
    body: 'Purpose-built administration interface for authorized platform operators. Full tenant management, configuration, and monitoring in one view.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'REST API & Automation',
    body: 'Every EPADM capability is available via a versioned REST API. Automate tenant operations, integrate with CI/CD pipelines, and build on the platform.',
  },
] as const;

export function CapabilitiesSection() {
  return (
    <section className="section capabilities" aria-labelledby="capabilities-heading">
      <div className="container">
        {/* Header */}
        <m.div
          className="section-header section-header--center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="section-header__eyebrow" style={{ justifyContent: 'center' }}>
            Capabilities
          </p>
          <h2 className="section-header__title" id="capabilities-heading">
            Built for the demands of enterprise platforms
          </h2>
          <p className="section-header__subtitle">
            EPADM ships with the capabilities that enterprise platform teams need
            to operate confidently at scale — not just the basics.
          </p>
        </m.div>

        {/* Capabilities grid */}
        <m.div
          className="capabilities__grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {capabilities.map((cap) => (
            <m.article
              key={cap.title}
              className="capabilities__card card card--feature"
              variants={fadeUp}
            >
              <div className="card__icon" aria-hidden="true">
                {cap.icon}
              </div>
              <h3 className="card__title">{cap.title}</h3>
              <p className="card__body">{cap.body}</p>
            </m.article>
          ))}
        </m.div>
      </div>
    </section>
  );
}
