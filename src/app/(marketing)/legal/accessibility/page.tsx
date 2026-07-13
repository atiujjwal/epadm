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
      </div>
    </div>
  );
}