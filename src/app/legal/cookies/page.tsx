import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How EPADM uses cookies on this website.',
  alternates: { canonical: '/legal/cookies' },
  robots: { index: true, follow: false },
};

export default function CookiesPage() {
  return (
    <div className="legal-page">
      <div className="container legal-page__layout">
        <header className="legal-page__header">
          <p className="label" style={{ marginBottom: 'var(--space-3)' }}>Legal</p>
          <h1 className="legal-page__heading">Cookie Policy</h1>
          <p className="legal-page__meta">Last updated: July 2025</p>
        </header>

        <div className="legal-page__content prose">
          <p>
            This Cookie Policy explains how EPADM uses cookies and similar technologies
            on this website.
          </p>

          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website.
            They are widely used to make websites work, improve performance, and provide
            information to website owners.
          </p>

          <h2>Cookies we use</h2>
          <p>
            This website uses only essential cookies necessary for the site to function
            correctly. We do not use advertising cookies, tracking cookies, or third-party
            analytics cookies that build individual user profiles.
          </p>
          <p>
            Essential cookies may include session identifiers required to maintain your
            state on the site (for example, form submissions or navigation state). These
            cookies are deleted when you close your browser or expire after a short period.
          </p>

          <h2>Cookies we do not use</h2>
          <p>
            We do not place advertising cookies, social media tracking pixels, or
            cross-site tracking cookies. We do not share cookie data with advertising
            networks.
          </p>

          <h2>Managing cookies</h2>
          <p>
            You can control cookies through your browser settings. Disabling cookies may
            affect the functionality of this website. See your browser&apos;s help documentation
            for instructions on managing cookies.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy if our cookie use changes. Check this page
            periodically for updates.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about cookies, contact us at{' '}
            <a href="mailto:privacy@epadm.in">privacy@epadm.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}