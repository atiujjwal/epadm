'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { ctaNav } from '@/config/site';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

const hoverCard = {
  hover: {
    y: -8,
    boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)',
    transition: { duration: 0.25 },
  },
};

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const pillars = [
    {
      num: '01',
      title: 'Biometric Automation',
      subtitle: 'Hardware-level ADMS synchronization protocol',
      desc: 'Connect your physical biometric devices directly with real-time ADMS sync, eliminating spreadsheet imports and data tampering.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
        </svg>
      ),
      badges: ['Real-time sync', 'Zero manual exports', 'Tamperproof audit logs'],
    },
    {
      num: '02',
      title: 'AI Academic Operations',
      subtitle: 'Generative exam & scheduling automation',
      desc: 'Auto-generate exam papers, compute conflict-free timetables, and surface context-aware policies with intelligent AI workflows.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      ),
      badges: ['Exam generation', 'Genetic timetables', 'School RAG base'],
    },
    {
      num: '03',
      title: 'DPDP Act 2023 Compliance',
      subtitle: 'Built-in data privacy controls for Indian schools',
      desc: 'Manage verifiable parental consent, audit access events, and enforce tenant isolation with DPDP-ready workflows.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      badges: ['Verifiable consent', 'Right to erase', 'Audit trails'],
    },
  ];

  const pricingTiers = [
    {
      name: 'Foundation',
      price: '₹25,000',
      period: 'flat / year',
      description: 'Core school administration and compliance tools for mid-sized private schools.',
      features: ['Up to 500 students', 'Student & staff directory', 'Basic gradebook', 'Parent consent registry', 'RLS-protected data', 'Standard email support'],
      cta: 'Get started',
      href: '/register',
      popular: false,
    },
    {
      name: 'Growth',
      price: '₹40',
      period: 'student / month',
      description: 'Complete operational automation with AI and biometric device sync.',
      features: ['Unlimited students', 'Everything in Foundation', 'Device ADMS sync', 'AI exam generator', 'Auto timetable scheduler', 'Parent & teacher portals', 'Priority support'],
      cta: 'Start 14-day free trial',
      href: '/register',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '₹60',
      period: 'student / month',
      description: 'Advanced features for multi-branch schools and education societies.',
      features: ['Multi-branch dashboard', 'Everything in Growth', 'White-label branding', 'Dedicated server', 'DPDP audit logging', 'Custom APIs', '24/7 account management'],
      cta: 'Contact sales',
      href: '/contact',
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'How does the biometric ADMS sync work?',
      a: 'Physical attendance machines communicate directly with EPADM over secure HTTPS, so no local server, static IP, or manual file uploads are required.',
    },
    {
      q: 'What tools are provided for DPDP Act 2023 compliance?',
      a: 'EPADM provides built-in consent capture, privacy workflows, access logging, and audit-ready controls for schools acting as data fiduciaries.',
    },
    {
      q: 'How does the AI timetable generator work?',
      a: 'A genetic algorithm considers teacher availability, room capacity, subject constraints, and school policy to generate conflict-free timetables quickly.',
    },
    {
      q: 'Can we migrate our existing student data to EPADM?',
      a: 'Yes. We support guided data migration via CSV/Excel with automated mapping and validation for student, teacher, and grade records.',
    },
    {
      q: 'Are there any hidden setup fees?',
      a: 'No. Our pricing is transparent. Foundation is flat ₹25,000/year and Growth/Enterprise are billed per active student.',
    },
  ];

  return (
    <div className="space-y-24 bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-500 blur-3xl mix-blend-screen" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <m.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
              <m.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
                End-to-End K-12 School Management
              </m.div>
              <m.h1 variants={itemVariants} className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Next-Gen <br />
                <span className="bg-gradient-to-r from-sky-300 to-indigo-200 bg-clip-text text-transparent">AI-Driven School</span> <br />
                Management.
              </m.h1>
              <m.p variants={itemVariants} className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                EPADM is an all-in-one K-12 administration SaaS engineered for mid-sized private schools in India. Streamline academic operations with generative AI, sync biometrics automatically, and achieve complete DPDP Act 2023 compliance.
              </m.p>
              <m.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href={ctaNav.primary.href} variant="primary" size="lg" className="min-w-[12rem]">
                  {ctaNav.primary.label}
                </Button>
                <Button href="/demo" variant="secondary" size="lg" className="min-w-[12rem]">
                  Request a Demo
                </Button>
              </m.div>
              <m.div variants={itemVariants} className="grid gap-3 sm:grid-cols-3">
                {['Hardware ADMS Sync', 'DPDP 2023 Compliant', 'Generative AI Tools'].map((label) => (
                  <div key={label} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{label}</span>
                  </div>
                ))}
              </m.div>
            </m.div>

            <m.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
              <div className="space-y-6 text-slate-100">
                <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-950/80 p-6 shadow-xl">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-800 text-slate-100">EP</span>
                      <div>
                        <p className="text-sm text-slate-400">Control Plane</p>
                        <p className="text-base font-semibold">Secure tenant network</p>
                      </div>
                    </div>
                    <span className="inline-flex rounded-2xl bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-200">Secure tenant</span>
                  </div>
                  <div className="rounded-3xl border border-slate-700/60 bg-slate-900 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">Latest sync</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-100">2m ago</p>
                      </div>
                      <span className="inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_0_8px_rgba(34,197,94,0.15)]" aria-hidden="true" />
                    </div>
                    <div className="grid gap-3">
                      <div className="rounded-3xl bg-slate-800/80 p-4">
                        <p className="text-sm text-slate-400">Connected devices</p>
                        <p className="mt-2 text-2xl font-semibold text-white">18</p>
                      </div>
                      <div className="rounded-3xl bg-slate-800/80 p-4">
                        <p className="text-sm text-slate-400">Audit events</p>
                        <p className="mt-2 text-2xl font-semibold text-white">4.2K</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-5 text-slate-100">
                    <p className="text-sm text-slate-400">Tenant uptime</p>
                    <p className="mt-2 text-3xl font-semibold">99.98%</p>
                  </div>
                  <div className="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-5 text-slate-100">
                    <p className="text-sm text-slate-400">Live workflows</p>
                    <p className="mt-2 text-3xl font-semibold">12</p>
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Core Features</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">The 3 Pillars of Modern School Administration</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">We replace legacy, slow school ERPs with a modern platform built on security, AI intelligence, and compliance.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <m.div key={pillar.num} variants={hoverCard} whileHover="hover">
                <Card padding="md" className="h-full">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                      {pillar.icon}
                    </div>
                    <span className="text-sm font-semibold text-indigo-700">{pillar.num}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-600">{pillar.subtitle}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{pillar.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {pillar.badges.map((badge) => (
                      <Badge key={badge} variant="outline" size="sm">{badge}</Badge>
                    ))}
                  </div>
                </Card>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Pricing Plans</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Transparent, Value-Based Plans</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">Choose the layout that matches your school’s growth model. Simple billing, zero onboarding fees, cancel anytime.</p>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {pricingTiers.map((tier) => (
              <m.div key={tier.name} variants={hoverCard} whileHover="hover">
                <Card padding="lg" className={`flex h-full flex-col gap-6 ${tier.popular ? 'border-indigo-200 shadow-lg' : ''}`}>
                  {tier.popular && (
                    <span className="inline-flex self-start rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Most Popular</span>
                  )}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-slate-900">{tier.name}</h3>
                    <div className="mt-3 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold text-slate-900">{tier.price}</span>
                      <span className="text-sm text-slate-500">/ {tier.period}</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{tier.description}</p>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <ul className="space-y-3 text-sm text-slate-600">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" aria-hidden="true" className="mt-0.5 flex-shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <Button href={tier.href} variant={tier.popular ? 'primary' : 'secondary'} className="w-full">
                      {tier.cta}
                    </Button>
                  </div>
                </Card>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Frequently Asked Questions</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Got Questions? We’ve Got Answers</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">Learn how EPADM fits your school infrastructure and operational requirements.</p>
          </div>

          <div className="mt-12 grid gap-4">
            {faqs.map((faq, index) => {
              const open = activeFaq === index;
              return (
                <div key={faq.q} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <button
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-slate-900 transition hover:bg-slate-50"
                    onClick={() => setActiveFaq(open ? null : index)}
                    aria-expanded={open}
                  >
                    <span>{faq.q}</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {open && (
                    <m.div
                      className="border-t border-slate-200 px-5 py-5 text-sm leading-7 text-slate-600"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p>{faq.a}</p>
                    </m.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
