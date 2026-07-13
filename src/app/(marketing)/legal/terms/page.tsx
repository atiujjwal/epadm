import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'EPADM terms of service and acceptable use policy.',
  alternates: { canonical: '/legal/terms' },
  robots: { index: true, follow: false },
};

const lastUpdated = 'July 2025';

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="container legal-page__layout">
        <header className="legal-page__header">
          <p className="label" style={{ marginBottom: 'var(--space-3)' }}>Legal</p>
          <h1 className="legal-page__heading">Terms of Service</h1>
          <p className="legal-page__meta">Last updated: {lastUpdated}</p>
        </header>

        <div className="legal-page__content prose">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of the EPADM website
            (www.epadm.in) and, where applicable, the EPADM platform. By accessing the
            site, you agree to these Terms.
          </p>

          <h2>Use of the website</h2>
          <p>
            This website is for informational purposes and to facilitate inquiries about
            the EPADM school management platform. You agree not to use this website for any unlawful
            purpose, to attempt to gain unauthorized access to any system or data, or to
            interfere with the site&apos;s availability.
          </p>

          <h2>Platform access</h2>
          <p>
            Access to the EPADM SaaS dashboard is governed by a separate Service Level Agreement between
            EPADM and your school/educational institution. These Terms do not grant any right to access
            the system. Platform use is subject to the service agreement executed by your school.
          </p>

          <h2>Intellectual property</h2>
          <p>
            All content on this website — including text, design, code, and brand assets
            — is owned by or licensed to EPADM. You may not reproduce, distribute, or
            create derivative works without our written consent.
          </p>

          <h2>Disclaimer of warranties</h2>
          <p>
            This website is provided &quot;as is&quot; without warranties of any kind. We do not
            warrant that the site will be error-free or continuously available. Information
            on this site is subject to change without notice.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, EPADM is not liable for any indirect,
            incidental, or consequential damages arising from your use of this website.
          </p>

          <h2>Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the site after
            changes constitutes acceptance of the updated Terms.
          </p>

          <h2>Governing law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes will be resolved in
            the jurisdiction specified in your school service agreement, or, for website-only
            matters, in the jurisdiction where EPADM is registered in India.
          </p>

          <h2>Contact</h2>
          <p>
            For legal questions, contact us at{' '}
            <a href="mailto:legal@epadm.in">legal@epadm.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}