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
    <section className="py-[var(--section-padding-y)]" aria-labelledby="workflow-heading">
      <div className="mx-auto w-full max-w-[90rem] px-[var(--gutter-xs)] sm:px-[var(--gutter-sm)] md:px-[var(--gutter-md)] lg:px-[var(--gutter-lg)] xl:px-[var(--gutter-xl)]">
        {/* Header */}
        <m.div
          className="flex flex-col gap-4 max-w-3xl items-center text-center mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-[var(--accent-primary)] flex items-center gap-2 justify-center">
            Built for every role
          </p>
          <h2 className="m-0 text-[var(--text-primary)]" id="workflow-heading">
            Different teams. One platform. No compromise.
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-[52ch] m-0">
            EPADM is designed so that platform teams, enterprise administrators, and
            data governance teams all get a purpose-fit experience — from the same system.
          </p>
        </m.div>

        {/* Persona selector */}
        <m.div
          className="flex flex-wrap items-center justify-center gap-2 mt-10 p-1 rounded-[var(--radius-lg)] bg-[var(--bg-surface-2)] border border-[var(--border-default)] w-fit mx-auto"
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
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer ${active === p.id ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm border border-[var(--border-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'}`}
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
            className="mt-8 grid gap-8 lg:grid-cols-2 items-start bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 md:p-8"
            variants={tabContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Copy */}
            <div className="flex flex-col gap-3">
              <h3 className="font-[var(--font-display)] text-xl font-semibold text-[var(--text-primary)] m-0 leading-snug">{current.headline}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">{current.description}</p>
            </div>

            {/* Workflow table */}
            <div className="flex flex-col gap-0 rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-surface-2)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-default)]">
                <span>Common workflow</span>
                <span>Time to complete</span>
              </div>
              {current.workflows.map((w) => (
                <div key={w.action} className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] last:border-b-0">
                  <div className="flex items-center gap-2.5 text-sm text-[var(--text-primary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                    {w.action}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
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
