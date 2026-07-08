'use client';

import { m } from 'framer-motion';
import { staggerContainer, fadeUp, fadeIn, viewportConfig } from '@/lib/motion';

const steps = [
  {
    step: '01',
    title: 'Tenant Provisioning',
    body: 'Administrators define a tenant template: configuration namespace, feature flags, quota limits, and access roles. EPADM provisions the tenant in isolation — ready in seconds, not hours.',
    visual: 'provision',
  },
  {
    step: '02',
    title: 'Policy & Access Assignment',
    body: 'RBAC roles are applied at platform, tenant, and resource level. Identity provider integration maps enterprise groups to EPADM roles automatically. No manual access provisioning per user.',
    visual: 'policy',
  },
  {
    step: '03',
    title: 'Data Pipeline Registration',
    body: 'Data flows are registered with EPADM\'s schema registry. Quality rules, classification labels, and lineage tracking activate immediately. Violations surface in real time — not post-hoc.',
    visual: 'pipeline',
  },
  {
    step: '04',
    title: 'Continuous Governance',
    body: 'The control plane monitors activity across all tenants. Policy drift, access anomalies, and data quality failures trigger alerts. The audit trail captures everything — immutably.',
    visual: 'govern',
  },
] as const;

const MetricBar = ({ label, value, pct, color = 'var(--accent-primary)' }: {
  label: string; value: string; pct: number; color?: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
    <div style={{ height: '4px', background: 'var(--bg-surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
      <m.div
        style={{ height: '100%', background: color, borderRadius: '999px' }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
      />
    </div>
  </div>
);

const StepVisual = ({ type }: { type: string }) => {
  if (type === 'provision') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      <div style={{ padding: '10px 14px', background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>New Tenant</span>
        <span style={{ color: 'var(--color-success-500)' }}>→ Provisioning</span>
      </div>
      {['Namespace created', 'Config applied', 'Quotas set', 'Roles assigned'].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
          <span style={{ color: 'var(--color-success-500)', fontWeight: 700 }}>✓</span>
          <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '10px' }}>{(i + 1) * 120}ms</span>
        </div>
      ))}
    </div>
  );

  if (type === 'policy') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      {[['Platform Admin', 'All resources', 'var(--accent-primary)'], ['Tenant Operator', 'Tenant scope', 'var(--color-indigo-300)'], ['Data Viewer', 'Read-only', 'var(--color-slate-400)']].map(([role, scope, color]) => (
        <div key={role as string} style={{ padding: '10px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color as string }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{role as string}</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>{scope as string}</span>
        </div>
      ))}
      <div style={{ padding: '8px 14px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px', textAlign: 'center', color: 'var(--color-success-500)', fontSize: '11px' }}>
        SSO mapping active via OIDC
      </div>
    </div>
  );

  if (type === 'pipeline') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      <MetricBar label="Schema compliance" value="99.8%" pct={99.8} color="var(--color-success-500)" />
      <MetricBar label="Data quality score" value="97.2%" pct={97.2} color="var(--accent-primary)" />
      <MetricBar label="Lineage coverage"   value="94.5%" pct={94.5} color="var(--color-indigo-300)" />
      <MetricBar label="Classification rate" value="100%" pct={100} color="var(--color-success-500)" />
    </div>
  );

  if (type === 'govern') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
      {[
        { time: '09:41:03', msg: 'Tenant "Acme" config updated', level: 'info' },
        { time: '09:41:47', msg: 'Role assigned: operator → jsmith', level: 'info' },
        { time: '09:42:11', msg: 'Data quality alert resolved',   level: 'success' },
        { time: '09:43:05', msg: 'Suspicious access pattern detected', level: 'warn' },
        { time: '09:43:12', msg: 'Policy block: unauthorized export',  level: 'error' },
      ].map((entry) => (
        <div key={entry.time} style={{ display: 'flex', gap: '8px', padding: '8px 10px', background: 'var(--bg-surface)', border: `1px solid ${entry.level === 'error' ? 'rgba(239,68,68,0.2)' : entry.level === 'warn' ? 'rgba(245,158,11,0.2)' : 'var(--border-subtle)'}`, borderRadius: '6px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '10px', flexShrink: 0 }}>{entry.time}</span>
          <span style={{ flex: 1, color: entry.level === 'error' ? 'rgba(239,68,68,0.85)' : entry.level === 'warn' ? 'rgba(245,158,11,0.85)' : 'var(--text-secondary)' }}>{entry.msg}</span>
        </div>
      ))}
    </div>
  );

  return null;
};

export function ArchitectureSection() {
  return (
    <section className="section architecture" aria-labelledby="architecture-heading">
      <div className="container">
        {/* Header */}
        <m.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="section-header__eyebrow">How it works</p>
          <h2 className="section-header__title" id="architecture-heading">
            From provisioning to governance —<br />one continuous workflow
          </h2>
          <p className="section-header__subtitle">
            EPADM connects every stage of the tenant lifecycle into a single governed
            workflow. No gaps, no manual handoffs, no configuration drift.
          </p>
        </m.div>

        {/* Steps */}
        <m.div
          className="architecture__steps"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {steps.map((step, index) => (
            <m.div
              key={step.step}
              className={`architecture__step${index % 2 === 1 ? ' architecture__step--reverse' : ''}`}
              variants={fadeUp}
            >
              {/* Copy */}
              <div className="architecture__step-copy">
                <div className="architecture__step-number" aria-hidden="true">
                  {step.step}
                </div>
                <h3 className="architecture__step-title">{step.title}</h3>
                <p className="architecture__step-body">{step.body}</p>
              </div>

              {/* Connector */}
              <div className="architecture__step-connector" aria-hidden="true">
                <div className="architecture__step-line" />
                <div className="architecture__step-node" />
                <div className="architecture__step-line" />
              </div>

              {/* Visual */}
              <div className="architecture__step-visual">
                <div className="architecture__step-card">
                  <div className="architecture__step-card-header">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      epadm / {step.visual}
                    </span>
                  </div>
                  <div className="architecture__step-card-body">
                    <StepVisual type={step.visual} />
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </m.div>
      </div>

      <style>{`
        .architecture {
          position: relative;
        }

        .architecture__steps {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          margin-top: var(--space-16);
        }

        .architecture__step {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--space-8);
          align-items: center;
        }

        .architecture__step--reverse {
          direction: rtl;
        }

        .architecture__step--reverse > * {
          direction: ltr;
        }

        .architecture__step-copy {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-8);
        }

        .architecture__step-number {
          font-family: var(--font-display);
          font-size: var(--text-5xl);
          font-weight: var(--weight-extrabold);
          color: var(--border-default);
          line-height: 1;
          letter-spacing: var(--tracking-tighter);
          user-select: none;
        }

        .architecture__step-title {
          font-size: clamp(1.4rem, 2vw, 1.75rem);
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          margin: 0;
          line-height: var(--leading-tight);
        }

        .architecture__step-body {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: none;
        }

        /* Central connector column */
        .architecture__step-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          height: 100%;
          min-height: 8rem;
        }

        .architecture__step-line {
          flex: 1;
          width: 1px;
          background: linear-gradient(180deg, transparent, var(--border-default), transparent);
          min-height: 2rem;
        }

        .architecture__step-node {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent-primary);
          border: 2px solid var(--bg-base);
          box-shadow: 0 0 0 4px var(--accent-subtle), var(--shadow-glow-sm);
          flex-shrink: 0;
        }

        /* Visual card */
        .architecture__step-visual {}

        .architecture__step-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          overflow: hidden;
        }

        .architecture__step-card-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          background: var(--color-white-04);
        }

        .architecture__step-card-body {
          padding: var(--space-5);
        }

        @media (max-width: 1024px) {
          .architecture__step {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }

          .architecture__step--reverse { direction: ltr; }
          .architecture__step-connector { display: none; }
          .architecture__step-number { font-size: var(--text-4xl); }
        }
      `}</style>
    </section>
  );
}
