'use client';

import { m } from 'framer-motion';
import { fadeUp, viewportConfig } from '@/lib/motion';

const steps = [
  { step: '01', title: 'Tenant Provisioning', body: 'Administrators define a tenant template and EPADM provisions the tenant in seconds with isolated config, quotas, and access roles.' },
  { step: '02', title: 'Policy & Access Assignment', body: 'RBAC roles apply at platform and tenant scope. Policies are enforced automatically so manual access changes are reduced significantly.' },
  { step: '03', title: 'Data Pipeline Registration', body: 'Register data flows with schema, quality, and lineage checks. Violations surface immediately instead of being discovered after the fact.' },
  { step: '04', title: 'Continuous Governance', body: 'The control plane monitors activity across tenants and flags drift, anomalous access, and governance gaps in real time.' },
] as const;

export function ArchitectureSection() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24" aria-labelledby="architecture-heading">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <m.div className="mx-auto max-w-2xl text-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportConfig} transition={{ duration: 0.55, ease: [0.25,0.46,0.45,0.94] }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">How it works</p>
          <h2 id="architecture-heading" className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">From provisioning to governance — one continuous workflow</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">EPADM connects every stage of the tenant lifecycle so your team can move faster without introducing risk.</p>
        </m.div>
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {steps.map((step) => (
            <m.article key={step.step} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" variants={fadeUp}>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold">{step.step}</div>
              <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
            </m.article>
          ))}
        </div>
      </div>
    </section>
  );
}
