import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Register | EPADM',
  description: 'Create your EPADM account to start managing your school efficiently.',
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  return (
    <div className="register-page">
      <div className="container">
        <h1 className="register-page__heading">Register for EPADM</h1>
        <p className="register-page__body">
          The registration page is currently under construction. Please check back soon.
        </p>
        <div className="register-page__actions">
          <Link href="/" className="btn btn--secondary">
            ← Return to Home
          </Link>
        </div>
      </div>

      <style>{`
        .register-page {
          padding-block: clamp(4rem, 8vw, 7rem);
          min-height: calc(100vh - var(--nav-height));
          display: flex;
          align-items: center;
        }

        .register-page__heading {
          font-size: clamp(2rem, 3.5vw + 0.5rem, 3rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          margin: 0 0 var(--space-4);
        }

        .register-page__body {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          max-width: 48ch;
          margin: 0 0 var(--space-6);
        }

        .register-page__actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
