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
    <div ref={ref} className={`border-b border-[#e8e9ed] bg-white px-4 py-4 md:px-6 ${className}`} {...rest}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-2 text-[11px] text-slate-500" aria-label="Breadcrumb">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[18px] font-semibold leading-tight tracking-tight text-[#252936]">{title}</h1>
            {badge && <span className="inline-flex items-center">{badge}</span>}
          </div>
          {description && <p className="mt-0.5 max-w-3xl text-[12px] leading-relaxed text-[#747a86]">{description}</p>}
        </div>

        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>
  );
});

// Styles are now consolidated into global CSS
const PageHeaderStyles = () => null;

export { PageHeaderStyles };
export default PageHeader;
