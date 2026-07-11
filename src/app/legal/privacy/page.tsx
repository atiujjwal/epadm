import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How EPADM collects, uses, and protects student and administrative data.',
  alternates: { canonical: '/legal/privacy' },
  robots: { index: true, follow: false },
};

const lastUpdated = 'July 2025';

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="container legal-page__layout">
        <header className="legal-page__header">
          <p className="label" style={{ marginBottom: 'var(--space-3)' }}>Legal</p>
          <h1 className="legal-page__heading">Privacy Policy</h1>
          <p className="legal-page__meta">Last updated: {lastUpdated}</p>
        </header>

        <div className="legal-page__content prose">
          <p>
            This Privacy Policy describes how EPADM ("we", "us", or "our") collects,
            uses, and shares personal data when you visit our marketing website
            (www.epadm.in), request a demonstration, or contact us.
          </p>

          <h2>DPDP Act 2023 Compliance</h2>
          <p>
            We process digital personal data in compliance with the Digital Personal Data Protection (DPDP) Act 2023.
            For details on how student and minor data is handled inside our SaaS platforms, please consult your school's data fiduciary officer. We act strictly as a Data Processor on behalf of schools.
          </p>

          <h2>Information we collect</h2>
          <p>
            When you fill out our demo request or contact forms, we collect the information
            you provide: your name, school email address, school name, role, student size, and any
            message you choose to include.
          </p>

          <h2>How we use your information</h2>
          <p>
            We use the information from demo and contact requests solely to respond to
            your inquiry and to schedule product demonstrations. We do not sell your
            personal information to third parties. We do not use your information for
            automated profiling or marketing without your consent.
          </p>

          <h2>Data retention</h2>
          <p>
            We retain marketing inquiry information for as long as reasonably necessary to follow
            up on your request and maintain records of our communications. You may request
            deletion of your information at any time by contacting us at
            privacy@epadm.in.
          </p>

          <h2>Cookies</h2>
          <p>
            This website uses essential session cookies required for the site to function.
            We do not use advertising or tracking cookies. See our{' '}
            <a href="/legal/cookies">Cookie Policy</a> for details.
          </p>

          <h2>Your rights</h2>
          <p>
            Under the DPDP Act 2023, you have the right to access, rectify, or withdraw consent
            regarding your personal information. To exercise these rights, contact us at privacy@epadm.in.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. When we do, we will update the
            "last updated" date at the top of this page.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy questions, contact us at{' '}
            <a href="mailto:privacy@epadm.in">privacy@epadm.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}