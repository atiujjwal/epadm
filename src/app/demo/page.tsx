import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DemoForm } from '@/components/forms/DemoForm';

export const metadata: Metadata = {
  title: 'Request a Demo',
  description:
    'Talk to the EPADM team. We\'ll walk through how our school management platform handles biometric sync, generative AI exams, and DPDP Act 2023 parent consent logging.',
  alternates: { canonical: '/demo' },
};

export default function DemoPage() {
  return (
    <div className="demo-page">
      <div className="container demo-page__layout">
        {/* Left column — copy */}
        <div className="demo-page__copy">
          <Badge variant="accent" style={{ marginBottom: 'var(--space-4)' }}>
            Request a Demo
          </Badge>
          <h1 className="demo-page__heading">
            See EPADM in Action
          </h1>
          <p className="demo-page__body">
            Let us walk you through a tailored demonstration of the EPADM School management dashboard. Tell us about your school size and current software setup, and we'll prepare a live walkthrough.
          </p>

          <Card variant="outlined" padding="md" className="demo-page__what-to-expect">
            <p className="demo-page__expect-label">What to expect</p>
            {[
              'A 20–30 minute guided call with a school software expert',
              'A live look at parent consent logging (DPDP compliance)',
              'Walkthrough of the AI exam generator & genetic timetable planner',
              'No sales pressure — just features and onboarding options',
            ].map((item) => (
              <div key={item} className="demo-page__expect-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Right column — form */}
        <Card variant="elevated" padding="lg" className="demo-page__form-container">
          <DemoForm />
        </Card>
      </div>

      <style>{`
        .demo-page {
          padding-block: clamp(4rem, 8vw, 7rem);
          min-height: calc(100vh - var(--nav-height));
          display: flex;
          align-items: center;
        }

        .demo-page__layout {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: var(--space-16);
          align-items: center;
        }

        .demo-page__copy {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .demo-page__heading {
          font-size: clamp(2rem, 3.5vw + 0.5rem, 3rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          margin: 0;
          line-height: var(--leading-tight);
        }

        .demo-page__body {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
        }

        .demo-page__what-to-expect {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-6);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          margin-top: var(--space-2);
        }

        .demo-page__expect-label {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          letter-spacing: var(--tracking-widest);
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 var(--space-2);
        }

        .demo-page__expect-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-snug);
        }

        .demo-page__expect-item svg { margin-top: 2px; flex-shrink: 0; }

        .demo-page__form-container {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
        }

        @media (max-width: 1024px) {
          .demo-page__layout { grid-template-columns: 1fr; gap: var(--space-10); }
          .demo-page { align-items: flex-start; }
        }

        @media (max-width: 640px) {
          .demo-page__form-container { padding: var(--space-6); }
        }
      `}</style>
    </div>
  );
}