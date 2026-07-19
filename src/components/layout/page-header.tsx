import { HTMLAttributes, forwardRef, ReactNode } from "react";
import Link from "next/link";

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

  return (
    <div ref={ref} className={`flex flex-col gap-6 ${className}`} {...rest}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {item.href ? (
                  <Link href={item.href} className="text-slate-600 transition hover:text-slate-900">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-500">{item.label}</span>
                )}
                {index < breadcrumb.length - 1 && (
                  <span aria-hidden="true" className="text-slate-400">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {badge && <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{badge}</span>}
          </div>
          {description && <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
        </div>

        {action && <div className="flex items-center">{action}</div>}
      </div>
    </div>
  );
});

// Styles are now consolidated into global CSS
const PageHeaderStyles = () => null;

export { PageHeaderStyles };
export default PageHeader;