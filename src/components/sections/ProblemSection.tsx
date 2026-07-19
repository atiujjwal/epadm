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
    <section className="py-[var(--section-padding-y)]" aria-labelledby="problem-heading">
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
            The challenge
          </p>
          <h2 className="m-0 text-[var(--text-primary)]" id="problem-heading">
            Enterprise platforms grow faster than they can be governed
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-[52ch] m-0">
            Without a dedicated control plane, platform teams spend most of their
            time managing complexity rather than delivering value.
          </p>
        </m.div>

        {/* Problem cards */}
        <m.div
          className="grid gap-6 sm:grid-cols-2 mt-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {problems.map((problem) => (
            <m.article
              key={problem.headline}
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 transition-all duration-200 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow-sm)]"
              variants={fadeUp}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-subtle)] text-[var(--accent-primary)] mb-4" aria-hidden="true">
                {problem.icon}
              </div>
              <h3 className="font-[var(--font-display)] text-xl font-semibold text-[var(--text-primary)] m-0 leading-snug">{problem.headline}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 mt-2">{problem.body}</p>
            </m.article>
          ))}
        </m.div>

        {/* Bridge statement */}
        <m.div
          className="flex items-center gap-4 mt-12 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" aria-hidden="true" />
          <p className="text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap px-4 m-0">
            EPADM is the system that closes all four gaps — in a single platform.
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" aria-hidden="true" />
        </m.div>
      </div>
    </section>
  );
}
