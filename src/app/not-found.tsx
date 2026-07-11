import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="container not-found__inner">
        <div className="not-found__code" aria-hidden="true">404</div>
        <h1 className="not-found__heading">Page not found</h1>
        <p className="not-found__body">
          The page you were looking for doesn't exist or has been moved.
        </p>
        <div className="not-found__actions">
          <Link href="/" className="btn btn--primary">
            Back to home
          </Link>
          <Link href="/demo" className="btn btn--secondary">
            Request a demo
          </Link>
        </div>
      </div>
    </div>
  );
}
