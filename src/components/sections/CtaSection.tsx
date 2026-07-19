'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { viewportConfig } from '@/lib/motion';
import { ctaNav, appUrls } from '@/config/site';
import { Badge } from '@/components/ui/badge';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,110,247,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.14),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <m.div
          className="relative overflow-hidden rounded-[2rem] border border-slate-800/90 bg-slate-900/95 p-10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.9)]"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Badge variant="accent" className="mb-8 inline-flex text-sm font-semibold tracking-wide uppercase">
            Ready when you are
          </Badge>

          <h2 id="cta-heading" className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            See EPADM in your environment
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Talk to the EPADM team about your platform architecture. We&apos;ll walk
            through how the control plane maps to your tenant model, access requirements,
            and data governance needs — with no pressure and no generic demo script.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={ctaNav.primary.href}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
            >
              {ctaNav.primary.label}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-3" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/platform"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Explore the platform
            </Link>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 text-sm text-slate-400 sm:flex-row sm:justify-center">
            <span className="h-px w-20 bg-slate-700" aria-hidden="true" />
            <span className="uppercase tracking-[0.24em] text-slate-400">Already using EPADM?</span>
            <span className="h-px w-20 bg-slate-700" aria-hidden="true" />
          </div>

          <div className="mt-10 mx-auto flex w-full max-w-2xl items-center gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-left text-slate-100 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.9)] sm:px-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-800 text-slate-100" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">School login</p>
              <p className="text-sm text-slate-400">Access your school workspace</p>
            </div>
            <Link
              href={appUrls.tenantLogin}
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 opacity-70" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
}
