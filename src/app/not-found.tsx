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

      <style>{`
        .not-found {
          min-height: calc(100vh - var(--nav-height));
          display: flex;
          align-items: center;
          justify-content: center;
          padding-block: var(--space-20);
        }

        .not-found__inner {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-5);
          max-width: 32rem;
        }

        .not-found__code {
          font-family: var(--font-display);
          font-size: clamp(6rem, 15vw, 10rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          color: var(--border-default);
          line-height: 1;
          user-select: none;
        }

        .not-found__heading {
          font-size: var(--text-3xl);
          font-weight: var(--weight-bold);
          margin: 0;
          color: var(--text-primary);
        }

        .not-found__body {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: none;
        }

        .not-found__actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
          justify-content: center;
          margin-top: var(--space-3);
        }
      `}</style>
    </div>
  );
}
