import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="bg-slate-50 py-24">
      <div className="container flex min-h-[60vh] flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white px-10 py-16 text-center shadow-sm">
        <div className="mb-8 rounded-full bg-slate-950 px-8 py-6 text-4xl font-semibold tracking-tight text-white">404</div>
        <h1 className="text-4xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
          The page you were looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to home
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Request a demo
          </Link>
        </div>
      </div>
    </div>
  );
}
