import { HTMLAttributes, forwardRef, ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  action?: ReactNode;
  badge?: ReactNode;
}

/**
 * EPADM PageHeader Component
 *
 * Consistent page header with breadcrumbs, title, description, and optional actions.
 *
 * @example
 * <PageHeader
 *   title="Dashboard"
 *   description="Welcome back, here's what's happening today"
 *   breadcrumb={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
 *   action={<Button>New Item</Button>}
 * />
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(props, ref) {
  const {
    title,
    description,
    breadcrumb,
    action,
    badge,
    className = "",
    ...rest
  } = props;

  const combinedClasses = ["page-header", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={combinedClasses} {...rest}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="page-header__breadcrumb" aria-label="Breadcrumb">
          <ol className="page-header__breadcrumb-list">
            {breadcrumb.map((item, index) => (
              <li key={index} className="page-header__breadcrumb-item">
                {item.href ? (
                  <Link href={item.href} className="page-header__breadcrumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className="page-header__breadcrumb-current">{item.label}</span>
                )}
                {index < breadcrumb.length - 1 && (
                  <svg className="page-header__breadcrumb-separator" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="page-header__content">
        <div className="page-header__title-wrapper">
          <h1 className="page-header__title">{title}</h1>
          {badge && <span className="page-header__badge">{badge}</span>}
        </div>

        {description && <p className="page-header__description">{description}</p>}
      </div>

      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
});

const PageHeaderStyles = () => (
  <style>{`
    .page-header {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--border-default);
      margin-bottom: var(--space-6);
    }

    .page-header__breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .page-header__breadcrumb-list {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .page-header__breadcrumb-item {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .page-header__breadcrumb-link {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color var(--duration-fast) var(--ease-default);
    }

    .page-header__breadcrumb-link:hover {
      color: var(--accent-primary);
    }

    .page-header__breadcrumb-current {
      color: var(--text-primary);
      font-weight: var(--weight-medium);
    }

    .page-header__breadcrumb-separator {
      width: 1rem;
      height: 1rem;
      color: var(--text-muted);
    }

    .page-header__content {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .page-header__title-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .page-header__title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: var(--weight-bold);
      color: var(--text-primary);
      margin: 0;
      line-height: var(--leading-tight);
    }

    .page-header__badge {
      display: inline-flex;
    }

    .page-header__description {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
      max-width: 60ch;
    }

    .page-header__action {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }

    @media (min-width: 640px) {
      .page-header {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
      }

      .page-header__content {
        flex: 1;
        min-width: 0;
      }

      .page-header__action {
        margin-top: 0;
      }
    }
  `}</style>
);

export { PageHeaderStyles };
export default PageHeader;