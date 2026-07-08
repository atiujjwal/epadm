'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { viewportConfig, tabContent, staggerContainer, fadeUp } from '@/lib/motion';

const tabs = [
  {
    id: 'tenants',
    label: 'School Management',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    heading: 'School & Branch operations, fully unified',
    body: 'Manage admissions, student directories, teacher assignments, and fees through a unified interface. Define institution-level settings, branch configurations, and academic rules — all from a single dashboard.',
    points: [
      'Multi-branch school administration from one dashboard',
      'Custom academic calendars and grade structures',
      'Automated fee reminders and collection tracking',
      'Complete student lifecycle audit trails',
    ],
  },
  {
    id: 'data',
    label: 'Student Data Security',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    heading: 'DPDP Act 2023 compliance built-in',
    body: 'Protect student and guardian privacy with absolute compliance. Track parental consent, monitor data access logs, and maintain complete visibility over student records — with zero complex legal setup.',
    points: [
      'Digital consent registry for minors',
      'End-to-end encryption for student records',
      'Audit-ready access logs for privacy compliance',
      'Right-to-erase and data access tools for parents',
    ],
  },
  {
    id: 'access',
    label: 'Role-Based Access',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    heading: 'Secure portals for teachers, parents, and staff',
    body: 'Define precise access rights for every user role in your institution. Teachers see their classrooms, parents view their children\'s performance, and accounts manage billing — all securely partitioned.',
    points: [
      'Dedicated portals for teachers, parents, and admins',
      'Secure sign-in with optional multi-factor verification',
      'Granular permission sets per department',
      'Activity history tracking for security auditing',
    ],
  },
  {
    id: 'integrations',
    label: 'School Integrations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
    heading: 'Connect hardware devices and tools seamlessly',
    body: 'EPADM connects directly with the hardware and software services your school relies on. Biometric attendance terminals, GPS school bus trackers, SMS notification APIs, and payment gateways — all synchronized.',
    points: [
      'Real-time biometric attendance sync (ADMS)',
      'Payment gateway integrations for online fees',
      'Automated SMS, WhatsApp, and email alerts',
      'GPS transport tracking for parents',
    ],
  },
] as const;

export function PlatformSection() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="section platform" aria-labelledby="platform-heading">
      <div className="container">
        {/* Header */}
        <m.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="section-header__eyebrow">School Operations</p>
          <h2 className="section-header__title" id="platform-heading">
            One Unified Platform.<br />Every School Dimension.
          </h2>
          <p className="section-header__subtitle">
            EPADM gives school administrators a single, unified system to manage the entire
            lifecycle of a K-12 school.
          </p>
        </m.div>

        {/* Tab navigation */}
        <m.div
          className="platform__tabs"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.4, delay: 0.15 }}
          role="tablist"
          aria-label="Platform capabilities"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`platform__tab${activeTab === tab.id ? ' platform__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </m.div>

        {/* Tab panel */}
        <AnimatePresence mode="wait">
          <m.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="platform__panel"
            variants={tabContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="platform__panel-copy">
              <h3 className="platform__panel-heading">{activeTabData.heading}</h3>
              <p className="platform__panel-body">{activeTabData.body}</p>
              <ul className="platform__panel-points" role="list">
                {activeTabData.points.map((point) => (
                  <li key={point} className="platform__panel-point">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual — simplified data card mock */}
            <div className="platform__panel-visual" aria-hidden="true">
              <PlatformVisual tab={activeTab} />
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      <style>{`
        .platform {
          background: linear-gradient(180deg, transparent 0%, var(--bg-surface) 40%, var(--bg-surface) 60%, transparent 100%);
        }

        .platform__tabs {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-12);
          flex-wrap: wrap;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0;
        }

        .platform__tab {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          color: var(--text-muted);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-family: var(--font-body);
          margin-bottom: -1px;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          transition:
            color var(--duration-fast),
            background var(--duration-fast),
            border-color var(--duration-fast);
        }

        .platform__tab:hover {
          color: var(--text-secondary);
          background: var(--color-white-04);
        }

        .platform__tab--active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
          background: var(--accent-subtle);
        }

        .platform__panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-14);
          align-items: center;
          padding-top: var(--space-12);
        }

        .platform__panel-copy {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .platform__panel-heading {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          line-height: var(--leading-tight);
          margin: 0;
        }

        .platform__panel-body {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: none;
        }

        .platform__panel-points {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .platform__panel-point {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-snug);
        }

        .platform__panel-point svg { margin-top: 2px; flex-shrink: 0; }

        .platform__panel-visual {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          min-height: 22rem;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .platform__panel { grid-template-columns: 1fr; gap: var(--space-8); }
          .platform__panel-visual { min-height: 16rem; }
          .platform__tabs { overflow-x: auto; flex-wrap: nowrap; }
        }
      `}</style>
    </section>
  );
}

/* ── Simplified visual mock per tab ───────────────────────── */
function PlatformVisual({ tab }: { tab: string }) {
  const configs: Record<string, React.ReactNode> = {
    tenants: <TenantListMock />,
    data: <DataPipelineMock />,
    access: <AccessMatrixMock />,
    integrations: <IntegrationsMock />,
  };
  return <>{configs[tab] ?? null}</>;
}

function TenantListMock() {
  const rows = [
    { name: 'Acme Corp', plan: 'Enterprise', status: 'Active',    users: 840 },
    { name: 'Globex Inc', plan: 'Business',   status: 'Active',    users: 212 },
    { name: 'Initech',   plan: 'Enterprise', status: 'Active',    users: 1104 },
    { name: 'Umbrella',  plan: 'Starter',    status: 'Suspended', users: 18  },
  ];
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', marginBottom: '4px' }}>
        <span style={{ flex: 2 }}>Tenant</span>
        <span style={{ flex: 1 }}>Plan</span>
        <span style={{ flex: 1 }}>Status</span>
        <span style={{ flex: 1, textAlign: 'right' }}>Users</span>
      </div>
      {rows.map((r) => (
        <div key={r.name} style={{ display: 'flex', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
          <span style={{ flex: 2, color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</span>
          <span style={{ flex: 1, color: 'var(--text-muted)' }}>{r.plan}</span>
          <span style={{ flex: 1 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', fontWeight: 600,
              color: r.status === 'Active' ? 'var(--color-success-500)' : 'var(--color-slate-400)',
              background: r.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(71,85,105,0.2)',
              padding: '2px 6px', borderRadius: '999px',
            }}>
              {r.status === 'Active' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-success-500)' }} />}
              {r.status}
            </span>
          </span>
          <span style={{ flex: 1, textAlign: 'right', color: 'var(--text-secondary)' }}>{r.users.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function DataPipelineMock() {
  const stages = ['Ingest', 'Validate', 'Transform', 'Classify', 'Store'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
      {stages.map((stage, i) => (
        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, opacity: 0.7 + i * 0.06 }} />
          <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>{stage}</span>
            <span style={{ fontSize: '10px', color: 'var(--color-success-500)', fontWeight: 600 }}>✓ OK</span>
          </div>
          {i < stages.length - 1 && (
            <div style={{ position: 'absolute', left: '12px', marginTop: '28px', width: '1px', height: '12px', background: 'var(--border-default)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function AccessMatrixMock() {
  const roles = ['Admin', 'Operator', 'Viewer'];
  const resources = ['Tenants', 'Data', 'Users', 'Config'];
  const matrix: Record<string, Record<string, string>> = {
    Admin:    { Tenants: '✓', Data: '✓', Users: '✓', Config: '✓' },
    Operator: { Tenants: '✓', Data: '✓', Users: '✓', Config: '—' },
    Viewer:   { Tenants: '✓', Data: '—', Users: '—', Config: '—' },
  };
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${resources.length}, 1fr)`, gap: '4px' }}>
        <div />
        {resources.map((r) => <span key={r} style={{ color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '8px' }}>{r}</span>)}
        {roles.map((role) => (
          <>
            <span key={role} style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>{role}</span>
            {resources.map((res) => (
              <span key={res} style={{
                textAlign: 'center', padding: '8px 4px',
                background: matrix[role][res] === '✓' ? 'rgba(79,110,247,0.1)' : 'var(--bg-surface)',
                borderRadius: '6px', border: '1px solid var(--border-subtle)',
                color: matrix[role][res] === '✓' ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: 700,
              }}>
                {matrix[role][res]}
              </span>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

function IntegrationsMock() {
  const integrations = [
    { name: 'PostgreSQL',    type: 'Data Store', connected: true },
    { name: 'Okta',          type: 'Identity',   connected: true },
    { name: 'Datadog',       type: 'Monitoring', connected: true },
    { name: 'Snowflake',     type: 'Warehouse',  connected: false },
    { name: 'PagerDuty',     type: 'Alerting',   connected: false },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {integrations.map((i) => (
        <div key={i.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{i.name[0]}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{i.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{i.type}</div>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: i.connected ? 'var(--color-success-500)' : 'var(--text-muted)', background: i.connected ? 'rgba(16,185,129,0.1)' : 'var(--bg-surface-2)', padding: '3px 8px', borderRadius: '999px' }}>
            {i.connected ? 'Connected' : 'Available'}
          </span>
        </div>
      ))}
    </div>
  );
}
