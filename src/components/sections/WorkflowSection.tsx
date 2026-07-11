'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { tabContent, viewportConfig } from '@/lib/motion';

const personas = [
  {
    id: 'platform-team',
    label: 'Platform Teams',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    headline: 'Own the platform without drowning in operations',
    description: 'Platform engineers get a dedicated control plane that lets them manage tenant lifecycles, enforce platform policies, and respond to operational events — without context-switching across a dozen tools.',
    workflows: [
      { action: 'Provision new tenant',          time: '< 30 seconds' },
      { action: 'Push config to 40+ tenants',    time: '< 2 minutes'  },
      { action: 'Investigate access anomaly',    time: '< 5 minutes'  },
      { action: 'Audit trail for compliance',    time: 'Instant export' },
    ],
  },
  {
    id: 'enterprise-admin',
    label: 'Enterprise Admins',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    headline: 'Govern access across every team and system',
    description: 'Enterprise administrators manage user roles, connect identity providers, and enforce consistent access policies across all tenants — from a single interface with full audit visibility.',
    workflows: [
      { action: 'Onboard new user group',        time: '< 1 minute'   },
      { action: 'Review all permission grants',  time: 'Real-time'    },
      { action: 'Revoke access org-wide',        time: '< 10 seconds' },
      { action: 'Generate compliance report',    time: 'On-demand'    },
    ],
  },
  {
    id: 'data-teams',
    label: 'Data & Compliance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    headline: 'Data governance that doesn\'t slow the business down',
    description: 'Data and compliance teams get schema enforcement, lineage tracking, and classification tooling built into the platform — not bolted on after the fact.',
    workflows: [
      { action: 'Register new data schema',       time: '< 1 minute'  },
      { action: 'Trace data lineage end-to-end',  time: 'On-demand'   },
      { action: 'Classify sensitive data fields', time: 'Automated'   },
      { action: 'Export lineage for audit',       time: 'Instant'     },
    ],
  },
] as const;

export function WorkflowSection() {
  const [active, setActive] = useState<string>(personas[0].id);
  const current = personas.find((p) => p.id === active)!;

  return (
    <section className="section workflow" aria-labelledby="workflow-heading">
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
            Built for every role
          </p>
          <h2 className="section-header__title" id="workflow-heading">
            Different teams. One platform. No compromise.
          </h2>
          <p className="section-header__subtitle">
            EPADM is designed so that platform teams, enterprise administrators, and
            data governance teams all get a purpose-fit experience — from the same system.
          </p>
        </m.div>

        {/* Persona selector */}
        <m.div
          className="workflow__selector"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.4, delay: 0.15 }}
          role="tablist"
          aria-label="User role workflows"
        >
          {personas.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={active === p.id}
              aria-controls={`workflow-panel-${p.id}`}
              className={`workflow__selector-btn${active === p.id ? ' workflow__selector-btn--active' : ''}`}
              onClick={() => setActive(p.id)}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </m.div>

        {/* Workflow panel */}
        <AnimatePresence mode="wait">
          <m.div
            key={active}
            id={`workflow-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`workflow-tab-${active}`}
            className="workflow__panel"
            variants={tabContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Copy */}
            <div className="workflow__panel-copy">
              <h3 className="workflow__panel-headline">{current.headline}</h3>
              <p className="workflow__panel-description">{current.description}</p>
            </div>

            {/* Workflow table */}
            <div className="workflow__panel-table">
              <div className="workflow__table-header">
                <span>Common workflow</span>
                <span>Time to complete</span>
              </div>
              {current.workflows.map((w) => (
                <div key={w.action} className="workflow__table-row">
                  <div className="workflow__table-action">
                    <span className="workflow__table-dot" aria-hidden="true" />
                    {w.action}
                  </div>
                  <div className="workflow__table-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {w.time}
                  </div>
                </div>
              ))}
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
