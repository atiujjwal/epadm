'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import {
  heroContainer,
  heroEyebrow,
  heroHeading,
  heroSubtitle,
  heroCta,
  heroVisual,
} from '@/lib/motion';
import { ctaNav, appUrls } from '@/config/site';
import { Badge } from '@/components/ui/badge';
import { TopologyGrid } from '@/components/ui/TopologyGrid';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-0 h-[34rem] w-[34rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute right-[-10rem] top-16 h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <m.div
          className="space-y-10"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <m.div variants={heroEyebrow}>
            <Badge variant="accent" className="inline-flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Enterprise Administration Platform
            </Badge>
          </m.div>

          <m.div>
            <m.h1
              variants={heroHeading}
              className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
            >
              Control every tenant.
              <br />
              <span className="bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900 bg-clip-text text-transparent">
                Govern everything.
              </span>
            </m.h1>

            <m.p variants={heroSubtitle} className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              EPADM is the enterprise control plane that gives platform teams unified
              authority over multi-tenant administration, data governance, and access
              policy — at any scale.
            </m.p>
          </m.div>

          <m.div variants={heroCta} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={ctaNav.primary.href}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {ctaNav.primary.label}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="ml-3"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/platform"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Explore the platform
            </Link>
          </m.div>

          <m.div variants={heroCta} className="grid gap-4 sm:grid-cols-3">
            {[
              'Multi-tenant by design',
              'Role-based access control',
              'Audit-ready governance',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </m.div>

          <m.div variants={heroCta}>
            <Link
              href={appUrls.tenantLogin}
              className="inline-flex items-center gap-3 text-sm font-semibold text-slate-900 transition hover:text-indigo-700"
            >
              <span>Existing tenant?</span>
              <span className="text-slate-500">Sign in to your workspace</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </m.div>
        </m.div>

        <m.div
          variants={heroVisual}
          initial="hidden"
          animate="visible"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3.5 w-3.5 rounded-full bg-rose-400/70" />
              <span className="flex h-3.5 w-3.5 rounded-full bg-amber-300/70" />
              <span className="flex h-3.5 w-3.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              EPADM Control Plane
            </span>
            <Badge variant="success" className="inline-flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
              Live
            </Badge>
          </div>

          <div className="mt-6 h-[32rem] min-h-[26rem] overflow-hidden rounded-[1.5rem] bg-slate-950 p-4 text-slate-100 shadow-inner sm:p-6">
            <TopologyGrid />
          </div>
        </m.div>
      </div>
    </section>
  );
}
