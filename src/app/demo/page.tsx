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
    </div>
  );
}