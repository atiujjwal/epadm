'use client';

import { m } from 'framer-motion';
import { staggerContainer, fadeUp, viewportConfig } from '@/lib/motion';

const problems = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    headline: 'Tenant sprawl with no visibility',
    body: 'As platforms grow, tenant configurations diverge silently. Teams lose track of who has access to what — and no single system shows the full picture.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    headline: 'Access policies that don\'t scale',
    body: 'Role definitions built for one tenant become technical debt at ten. Enforcing consistent, auditable access across a growing tenant base requires a purpose-built system.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    headline: 'Data pipelines without governance',
    body: 'Data flowing between tenants and systems lacks unified schema enforcement, lineage tracking, or quality controls. Compliance audits become painful and manual.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    headline: 'Administration that slows teams down',
    body: 'Onboarding a new tenant requires manual work across five systems. Configuration changes require code. Operational complexity grows faster than headcount.',
  },
] as const;

export function ProblemSection() {
  return (
    <section className="section problem" aria-labelledby="problem-heading">
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
            The challenge
          </p>
          <h2 className="section-header__title" id="problem-heading">
            Enterprise platforms grow faster than they can be governed
          </h2>
          <p className="section-header__subtitle">
            Without a dedicated control plane, platform teams spend most of their
            time managing complexity rather than delivering value.
          </p>
        </m.div>

        {/* Problem cards */}
        <m.div
          className="problem__grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {problems.map((problem) => (
            <m.article
              key={problem.headline}
              className="problem__card"
              variants={fadeUp}
            >
              <div className="problem__card-icon" aria-hidden="true">
                {problem.icon}
              </div>
              <h3 className="problem__card-title">{problem.headline}</h3>
              <p className="problem__card-body">{problem.body}</p>
            </m.article>
          ))}
        </m.div>

        {/* Bridge statement */}
        <m.div
          className="problem__bridge"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        >
          <div className="problem__bridge-line" aria-hidden="true" />
          <p className="problem__bridge-text">
            EPADM is the system that closes all four gaps — in a single platform.
          </p>
          <div className="problem__bridge-line" aria-hidden="true" />
        </m.div>
      </div>

      <style>{`
        .problem__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-5);
          margin-top: var(--space-14);
        }

        .problem__card {
          padding: var(--space-6);
          background: linear-gradient(160deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
        }

        .problem__card:hover {
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.1), var(--shadow-md);
        }

        .problem__card-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-lg);
          color: rgba(239, 68, 68, 0.8);
          flex-shrink: 0;
        }

        .problem__card-title {
          font-size: var(--text-base);
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          line-height: var(--leading-snug);
          margin: 0;
        }

        .problem__card-body {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: none;
        }

        .problem__bridge {
          margin-top: var(--space-14);
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }

        .problem__bridge-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-default));
        }

        .problem__bridge-line:last-child {
          background: linear-gradient(90deg, var(--border-default), transparent);
        }

        .problem__bridge-text {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          text-align: center;
          white-space: nowrap;
          margin: 0;
          max-width: none;
        }

        @media (max-width: 1024px) {
          .problem__grid { grid-template-columns: repeat(2, 1fr); }
          .problem__bridge-text { white-space: normal; }
        }

        @media (max-width: 640px) {
          .problem__grid { grid-template-columns: 1fr; }
          .problem__bridge { flex-direction: column; text-align: center; }
          .problem__bridge-line { width: 100%; height: 1px; }
        }
      `}</style>
    </section>
  );
}
