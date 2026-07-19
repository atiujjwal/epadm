import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Register | EPADM',
  description: 'Create your EPADM account to start managing your school efficiently.',
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  return (
    <div className="bg-slate-50 py-24">
      <div className="container max-w-3xl rounded-[2rem] border border-slate-200 bg-white px-8 py-16 text-slate-950 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight">Register for EPADM</h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
          The registration page is currently under construction. Please check back soon.
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
