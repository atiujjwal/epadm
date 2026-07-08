import type { Metadata } from 'next';
import Link from 'next/link';
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
          <p className="label" style={{ marginBottom: 'var(--space-4)' }}>Security & Compliance</p>
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
            <section key={section.id} id={section.id} className="security-page__section" aria-labelledby={`sh-${section.id}`}>
              <h2 id={`sh-${section.id}`} className="security-page__section-title">
                {section.title}
              </h2>
              {section.content.split('\n\n').map((para, i) => (
                <p key={i} className="security-page__section-body">{para}</p>
              ))}
            </section>
          ))}

          {/* Contact */}
          <div className="security-page__contact">
            <h2>DPDP & Security Inquiries</h2>
            <p>
              Do you have specific questions about data residency in India or need to review our DPDP Data Processing Agreement (DPA)? Contact our compliance team.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              <a href={`mailto:${siteConfig.contactEmail}`} className="btn btn--secondary">
                Email Compliance Team
              </a>
              <Link href="/demo" className="btn btn--primary">
                Schedule Compliance Review
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .security-page__hero {
          padding-block: clamp(4rem, 8vw, 7rem);
          border-bottom: 1px solid var(--border-subtle);
          background: linear-gradient(135deg, var(--bg-base) 0%, var(--bg-surface) 100%);
        }

        .security-page__hero-inner { max-width: 48rem; }

        .security-page__heading {
          font-size: clamp(2rem, 3.5vw + 0.5rem, 3rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          margin: 0 0 var(--space-5);
          line-height: var(--leading-tight);
        }

        .security-page__subheading {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: 52ch;
        }

        .security-page__body {
          display: grid;
          grid-template-columns: 14rem 1fr;
          gap: var(--space-14);
          padding-block: var(--space-16);
          align-items: start;
        }

        .security-page__toc {
          position: sticky;
          top: calc(var(--nav-height) + var(--space-8));
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .security-page__toc-label {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          letter-spacing: var(--tracking-widest);
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 var(--space-3);
        }

        .security-page__toc ul { list-style: none; display: flex; flex-direction: column; gap: var(--space-1); }

        .security-page__toc-link {
          font-size: var(--text-sm);
          color: var(--text-muted);
          text-decoration: none;
          padding: var(--space-1-5) var(--space-3);
          border-left: 2px solid transparent;
          display: block;
          transition: color var(--duration-fast), border-color var(--duration-fast);
        }

        .security-page__toc-link:hover {
          color: var(--text-primary);
          border-left-color: var(--accent-primary);
        }

        .security-page__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }

        .security-page__section { scroll-margin-top: calc(var(--nav-height) + var(--space-6)); }

        .security-page__section-title {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          margin: 0 0 var(--space-5);
          color: var(--text-primary);
        }

        .security-page__section-body {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0 0 var(--space-4);
          max-width: 68ch;
        }

        .security-page__contact {
          padding: var(--space-8);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          scroll-margin-top: calc(var(--nav-height) + var(--space-6));
        }

        .security-page__contact h2 {
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
          margin: 0;
        }

        .security-page__contact p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
        }

        @media (max-width: 1024px) {
          .security-page__body { grid-template-columns: 1fr; }
          .security-page__toc { position: static; display: none; }
        }
      `}</style>
    </div>
  );
}
