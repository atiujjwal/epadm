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
            affect the functionality of this website. See your browser's help documentation
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

      <style>{`
        .legal-page {
          padding-block: clamp(4rem, 8vw, 7rem);
          min-height: calc(100vh - var(--nav-height));
        }

        .legal-page__layout {
          max-width: 48rem;
          display: flex;
          flex-direction: column;
          gap: var(--space-10);
        }

        .legal-page__header { display: flex; flex-direction: column; gap: var(--space-2); }

        .legal-page__heading {
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          margin: 0;
        }

        .legal-page__meta {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin: 0;
        }

        .legal-page__content h2 {
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          margin-top: var(--space-10);
          margin-bottom: var(--space-4);
        }

        .legal-page__content p {
          margin-bottom: var(--space-4);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          font-size: var(--text-base);
          max-width: 68ch;
        }

        .legal-page__content a {
          color: var(--accent-primary);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      `}</style>
    </div>
  );
}