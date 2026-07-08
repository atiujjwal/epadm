import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: "EPADM's commitment to web accessibility and WCAG compliance.",
  alternates: { canonical: '/legal/accessibility' },
  robots: { index: true, follow: false },
};

export default function AccessibilityPage() {
  return (
    <div className="legal-page">
      <div className="container legal-page__layout">
        <header className="legal-page__header">
          <p className="label" style={{ marginBottom: 'var(--space-3)' }}>
            Legal
          </p>
          <h1 className="legal-page__heading">Accessibility Statement</h1>
          <p className="legal-page__meta">Last updated: July 2025</p>
        </header>

        <div className="legal-page__content prose">
          <p>
            EPADM is committed to making this website accessible to all users, including
            people with disabilities. We aim to conform to the Web Content Accessibility
            Guidelines (WCAG) 2.2, Level AA.
          </p>

          <h2>Our approach</h2>
          <p>
            This website is built with accessibility as a requirement, not an
            afterthought. Specific measures include:
          </p>
          <ul>
            <li>Semantic HTML structure with correct heading hierarchy</li>
            <li>Keyboard navigation support throughout the site</li>
            <li>Visible focus indicators for all interactive elements</li>
            <li>Skip navigation link to bypass repeated content</li>
            <li>Sufficient color contrast for all text and UI elements</li>
            <li>Descriptive alt text for non-decorative images</li>
            <li>Accessible form labels, error messages, and status notifications</li>
            <li>ARIA attributes used only where native semantics are insufficient</li>
            <li>Support for prefers-reduced-motion for users who prefer reduced animation</li>
            <li>Touch target sizing meeting WCAG 2.5.5 requirements</li>
            <li>Zoom resilience up to 200%</li>
          </ul>

          <h2>Known limitations</h2>
          <p>
            We are continuously working to improve accessibility. If you encounter any
            barrier, please contact us so we can address it promptly.
          </p>

          <h2>Feedback and contact</h2>
          <p>
            If you experience difficulty accessing any part of this website, or have
            suggestions for improvement, please contact us at{' '}
            <a href="mailto:accessibility@epadm.in">accessibility@epadm.in</a>.
            We aim to respond within 5 business days.
          </p>

          <h2>Enforcement</h2>
          <p>
            If you are not satisfied with our response to your accessibility request,
            you may contact the relevant regulatory body in your jurisdiction.
          </p>
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

          .legal-page__content p, .legal-page__content li {
            margin-bottom: var(--space-3);
            color: var(--text-secondary);
            line-height: var(--leading-relaxed);
            font-size: var(--text-base);
          }

          .legal-page__content ul {
            padding-left: var(--space-6);
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
            margin-bottom: var(--space-4);
          }

          .legal-page__content p { max-width: 68ch; }

          .legal-page__content a {
            color: var(--accent-primary);
            text-decoration: underline;
            text-underline-offset: 2px;
          }

          .legal-page__content code {
            font-family: var(--font-mono);
            font-size: 0.875em;
            background: var(--bg-surface);
            padding: 1px 6px;
            border-radius: var(--radius-sm);
            color: var(--color-indigo-200);
          }
        `}</style>
      </div>
    </div>
  );
}