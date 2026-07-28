import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface StatusBadge {
  label: string;
  variant: "default" | "success" | "warning" | "danger" | "info";
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: StatusBadge | ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
  /** @deprecated Use description. */
  subtitle?: string;
  /** @deprecated Use breadcrumbs. */
  breadcrumb?: BreadcrumbItem[];
  /** @deprecated Use actions. */
  action?: ReactNode;
}

function isStatusBadge(value: StatusBadge | ReactNode): value is StatusBadge {
  return Boolean(
    value &&
      typeof value === "object" &&
      "label" in value &&
      "variant" in value,
  );
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  toolbar,
  className,
  subtitle,
  breadcrumb,
  action,
}: PageHeaderProps) {
  const resolvedDescription = description ?? subtitle;
  const resolvedBreadcrumbs = breadcrumbs ?? breadcrumb;
  const resolvedActions = actions ?? action;

  return (
    <div className={cn("space-y-3 pb-4", className)}>
      {resolvedBreadcrumbs && resolvedBreadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-xs text-muted-foreground">
            {resolvedBreadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                ) : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
            {badge
              ? isStatusBadge(badge)
                ? <Badge variant={badge.variant}>{badge.label}</Badge>
                : badge
              : null}
          </div>
          {resolvedDescription ? (
            <p className="text-sm text-muted-foreground">{resolvedDescription}</p>
          ) : null}
        </div>

        {resolvedActions ? (
          <div className="flex shrink-0 items-center gap-2">{resolvedActions}</div>
        ) : null}
      </div>

      {toolbar ? <div>{toolbar}</div> : null}
    </div>
  );
}

export const PageHeaderStyles = () => null;
export default PageHeader;
