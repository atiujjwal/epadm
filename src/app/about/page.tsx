import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About EPADM',
  description:
    'EPADM is built to empower Indian K-12 private schools with modern administrative software, advanced AI automation, and rigorous DPDP Act compliance.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-page__hero">
        <div className="container about-page__hero-inner">
          <Badge variant="accent" style={{ marginBottom: 'var(--space-4)' }}>About Us</Badge>
          <h1 className="about-page__heading">
            Modern School Administration, Reimagined
          </h1>
          <p className="about-page__subheading">
            Indian private schools deserve better than legacy, clunky, and insecure database systems. EPADM exists to bring enterprise-grade security, hardware biometrics automation, and generative AI features to mid-sized schools.
          </p>
        </div>
      </div>

      <div className="container about-page__body">
        <div className="about-page__content">
          <section aria-labelledby="about-mission">
            <h2 id="about-mission">Why EPADM exists</h2>
            <p>
              Private K-12 education in India is evolving rapidly, but the backend tools schools use to manage operations are stuck in the past. Administrators waste hours exporting files from attendance machines, teachers manually format CBSE question papers, and student databases are exposed to significant security risks.
            </p>
            <p>
              EPADM (Educational Platform Administration & Management) was built to bridge this technology gap. We offer a unified cloud SaaS platform that isolates student records securely, automates complex scheduling, and provides compliance tools aligned with the Digital Personal Data Protection (DPDP) Act 2023.
            </p>
          </section>

          <section aria-labelledby="about-what">
            <h2 id="about-what">Our Core Values</h2>
            <div className="about-page__values">
              {[
                {
                  title: 'Aesthetics & Usability',
                  body: 'We believe school software should be as delightful to use as the best consumer applications. Our interface is clean, modern, fully responsive, and responsive to the needs of teachers, parents, and administrative staff alike.',
                },
                {
                  title: 'Security by Design',
                  body: 'With Row-Level Security (RLS) and strict database isolation, we ensure student records, marks, and profiles are accessible only to authorized personnel. Data boundaries are enforced at the query level, never bypassed.',
                },
                {
                  title: 'DPDP Act 2023 Compliance',
                  body: 'As a data fiduciary helper, we provide the verifiable consent portals, audit trails, and data erasure workflows necessary to safeguard minors data under India modern privacy laws.',
                },
              ].map((v) => (
                <Card key={v.title} variant="elevated" padding="md" className="about-page__value">
                  <h3 className="about-page__value-title">{v.title}</h3>
                  <p className="about-page__value-body">{v.body}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <Card variant="outlined" padding="lg" className="about-page__cta">
          <h2>Bring EPADM to Your School</h2>
          <p>
            Want to see how EPADM fits your academic board requirements (CBSE, ICSE, or State Board)? Talk to our product team for a customized setup walk-through.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
            <Button href="/demo" variant="primary">Request a Demo</Button>
            <Button href="/contact" variant="secondary">Contact Sales</Button>
          </div>
        </Card>
      </div>

      <style>{`
        .about-page__hero {
          padding-block: clamp(4rem, 8vw, 7rem);
          border-bottom: 1px solid var(--border-subtle);
          background: linear-gradient(135deg, var(--bg-base) 0%, var(--bg-surface) 100%);
        }

        .about-page__hero-inner { max-width: 52rem; }

        .about-page__heading {
          font-size: clamp(2rem, 3.5vw + 0.5rem, 3rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          margin: 0 0 var(--space-5);
          line-height: var(--leading-tight);
        }

        .about-page__subheading {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: 58ch;
        }

        .about-page__body {
          padding-block: var(--space-20);
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          max-width: 56rem;
        }

        .about-page__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }

        .about-page__content section { display: flex; flex-direction: column; gap: var(--space-4); }

        .about-page__content h2 {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          margin: 0;
        }

        .about-page__content p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: 64ch;
        }

        .about-page__values {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .about-page__value {
          padding: var(--space-6);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .about-page__value-title {
          font-size: var(--text-base);
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          margin: 0;
        }

        .about-page__value-body {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: none;
        }

        .about-page__cta {
          padding: var(--space-8) var(--space-10);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .about-page__cta h2 {
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          margin: 0;
        }

        .about-page__cta p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: 52ch;
        }

        @media (max-width: 640px) {
          .about-page__cta { padding: var(--space-6); }
        }
      `}</style>
    </div>
  );
}
