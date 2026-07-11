import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Platform Overview',
  description:
    'Discover the EPADM K-12 management modules: School ERP directory, Biometric sync, AI Academic planning, and DPDP compliance framework.',
  alternates: { canonical: '/platform' },
};

const capabilities = [
  {
    title: 'School ERP & Directory',
    description: 'Manage student admissions, parent linkings, teacher records, class sections, and staff directories with isolated data security.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Biometric ADMS Integration',
    description: 'Sync fingerprint/RFID attendance hardware directly via cloud ADMS protocols. Eliminate manual excel sheets and proxy records.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
  },
  {
    title: 'AI Academic Planning',
    description: 'Generate CBSE/ICSE exam papers automatically. Formulate conflict-free timetables via Genetic Algorithms. Query board docs via RAG.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'DPDP Compliance Portal',
    description: 'Verify and log parental consent. Allow parents to edit, access, or erase minor child information in line with DPDP Act 2023 regulations.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
] as const;

const principles = [
  {
    title: 'Row-Level Database Isolation',
    body: 'Each school tenant runs on isolated row partitions. Under no circumstances can data leaks occur between school branches or separate institutions.',
  },
  {
    title: 'Hardware-to-Cloud Stream',
    body: 'Device communication uses a push mechanism over HTTPS. If the connection fails, devices store logs locally and auto-retry once online.',
  },
  {
    title: 'Frictionless Parent Portal',
    body: 'A simplified interface optimized for Indian parents on mobile viewports. Request leaves, pay fees, and access reports in seconds.',
  },
  {
    title: 'Verifiable Consent Chains',
    body: 'Every consent given by a parent for school transport, media release, or health check is timestamped, hashed, and signed in audit logs.',
  },
] as const;

export default function PlatformPage() {
  return (
    <div className="platform-page">
      {/* Hero */}
      <div className="platform-page__hero">
        <div className="container platform-page__hero-inner">
          <Badge variant="accent" style={{ marginBottom: 'var(--space-4)' }}>The Platform</Badge>
          <h1 className="platform-page__heading">
            Tailored Modules for Modern School Administration
          </h1>
          <p className="platform-page__subheading">
            EPADM organizes school databases, automate core processes like attendance and lesson timetables, and keeps records legally compliant with zero complex workflows.
          </p>
          <div className="platform-page__hero-ctas">
            <Button href="/demo" variant="primary" size="lg">
              Request a Demo
            </Button>
            <Button href="/security" variant="secondary" size="lg">
              Security & DPDP compliance
            </Button>
          </div>
        </div>
      </div>

      <div className="container platform-page__body">
        {/* Capability cards */}
        <section aria-labelledby="platform-capabilities-heading">
          <h2 id="platform-capabilities-heading" className="platform-page__section-heading">
            Platform Modules
          </h2>
          <div className="platform-page__grid">
            {capabilities.map((cap) => (
              <Card key={cap.title} variant="elevated" padding="md" className="platform-page__cap-card">
                <div className="platform-page__cap-icon" aria-hidden="true">
                  {cap.icon}
                </div>
                <div className="platform-page__cap-copy">
                  <h3 className="platform-page__cap-title">{cap.title}</h3>
                  <p className="platform-page__cap-body">{cap.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Design principles */}
        <section className="platform-page__principles" aria-labelledby="platform-principles-heading">
          <h2 id="platform-principles-heading" className="platform-page__section-heading">
            Architectural Principles
          </h2>
          <div className="platform-page__principles-grid">
            {principles.map((p) => (
              <Card key={p.title} variant="outlined" padding="md" className="platform-page__principle">
                <h3 className="platform-page__principle-title">{p.title}</h3>
                <p className="platform-page__principle-body">{p.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <Card variant="outlined" padding="lg" className="platform-page__cta-strip">
          <div>
            <h2 className="platform-page__cta-strip-title">
              Ready to upgrade your school ERP?
            </h2>
            <p className="platform-page__cta-strip-body">
              Let us demonstrate how easy it is to import your students data.
            </p>
          </div>
          <Button href="/demo" variant="primary" size="lg" style={{ flexShrink: 0 }}>
            Request a Demo
          </Button>
        </Card>
      </div>
    </div>
  );
}
