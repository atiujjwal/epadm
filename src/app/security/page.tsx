import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Security & DPDP Compliance',
  description:
    'EPADM security and compliance protocols for K-12 private schools in India: DPDP Act 2023 compliance, student data Row-Level Security isolation, and biometric data protection.',
  alternates: { canonical: '/security' },
};

const sections = [
  {
    id: 'dpdp',
    title: 'DPDP Act 2023 Compliance',
    content: `EPADM is engineered for India’s Digital Personal Data Protection (DPDP) Act 2023. As school data processors, we provide a complete suite of data fiduciary tools to help schools fulfill their regulatory obligations.
    
    Our system features integrated parent portals to collect and verify parental consent for minor students under 18 years of age. All consent agreements for transport, extracurriculars, and directory inclusion are timestamped, logged, and exportable.`,
  },
  {
    id: 'isolation',
    title: 'Row-Level Database Isolation',
    content: `To ensure complete security, student and administrative records are isolated using strict Row-Level Security (RLS) policies in our database. Data query paths are automatically scoped by school tenant IDs.
    
    This guarantees that administrative staff, teachers, and parents from one school cannot access or query any record belonging to another institution, maintaining absolute boundary security.`,
  },
  {
    id: 'parental-rights',
    title: 'Parental Data Control & Rights',
    content: `Under the DPDP framework, parents have the right to access, correct, and erase their child's digital footprint. EPADM handles these requests through automated administrative workflows.
    
    Fiduciaries can easily generate comprehensive student summary reports or initiate a secure record erasure pipeline upon parent verification, with complete tracking of all deletion events.`,
  },
  {
    id: 'biometrics',
    title: 'Biometric Access Protection',
    content: `Biometric attendance logs are sensitive personal data. EPADM's ADMS sync service does not store raw fingerprint templates on the cloud. Only check-in logs and machine credentials are synchronised.
    
    Communications between biometric hardware terminals and the EPADM cloud are encrypted using TLS, protecting pupil and staff identity logs from network sniffing or local manipulation.`,
  },
  {
    id: 'encryption',
    title: 'Encryption & API Safety',
    content: `All databases are encrypted at rest using AES-256. Web pages, APIs, and mobile dashboards communicate exclusively over HTTPS utilizing TLS 1.3 protocol.
    
    API endpoints are rate-limited and protected with cryptographically signed tokens. We perform automated daily backups with isolated backup storage policies for maximum business continuity.`,
  },
] as const;

export default function SecurityPage() {
  return (
    <div className="security-page">
      {/* Hero */}
      <div className="security-page__hero">
        <div className="container security-page__hero-inner">
          <Badge variant="accent" style={{ marginBottom: 'var(--space-4)' }}>Security & Compliance</Badge>
          <h1 className="security-page__heading">
            Enterprise-Grade School Data Protection
          </h1>
          <p className="security-page__subheading">
            EPADM protects sensitive minor student data through active database isolation, encrypted biometric sync, and strict DPDP Act 2023 compliance tools.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container security-page__body">
        <nav className="security-page__toc" aria-label="Security sections">
          <p className="security-page__toc-label">On this page</p>
          <ul role="list">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="security-page__toc-link">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="security-page__content">
          {sections.map((section) => (
            <Card key={section.id} id={section.id} variant="outlined" padding="lg" className="security-page__section" aria-labelledby={`sh-${section.id}`}>
              <h2 id={`sh-${section.id}`} className="security-page__section-title">
                {section.title}
              </h2>
              {section.content.split('\n\n').map((para, i) => (
                <p key={i} className="security-page__section-body">{para}</p>
              ))}
            </Card>
          ))}

          {/* Contact */}
          <Card variant="elevated" padding="lg" className="security-page__contact">
            <h2>DPDP & Security Inquiries</h2>
            <p>
              Do you have specific questions about data residency in India or need to review our DPDP Data Processing Agreement (DPA)? Contact our compliance team.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              <Button href={`mailto:${siteConfig.contactEmail}`} variant="secondary">
                Email Compliance Team
              </Button>
              <Button href="/demo" variant="primary">
                Schedule Compliance Review
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
