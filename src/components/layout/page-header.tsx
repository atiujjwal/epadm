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

// Styles are now consolidated into global CSS
const PageHeaderStyles = () => null;

export { PageHeaderStyles };
export default PageHeader;