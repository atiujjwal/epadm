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
    </div>
  );
}
