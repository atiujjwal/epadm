"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { cn } from "@/lib/cn";
import { ChevronRight, ShieldCheck } from "lucide-react";

export interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  items?: Array<{
    label: string;
    href?: string;
    icon?: ReactNode;
    badge?: ReactNode;
    disabled?: boolean;
  }>;
  operatorName?: string;
  operatorEmail?: string;
  onSignOut?: () => void;
}

export const AdminSidebar = forwardRef<HTMLElement, AdminSidebarProps>(function AdminSidebar(
  props,
  ref,
) {
  const {
    items = [],
    operatorName,
    operatorEmail,
    onSignOut,
    className = "",
    ...rest
  } = props;

  const pathname = usePathname();
  const router = useRouter();

  async function handleDefaultSignOut() {
    await fetchWithCsrf("/api/platform/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const activeSignOut = onSignOut || handleDefaultSignOut;

  return (
    <aside
      ref={ref}
      className={cn(
        "w-60 shrink-0 h-screen sticky top-0 left-0 border-r bg-surface-muted/40 flex flex-col",
        className,
      )}
      {...rest}
    >
      <div className="h-14 border-b px-3 flex items-center gap-2 shrink-0">
        <div className="h-7 w-7 rounded-md bg-danger text-danger-foreground grid place-items-center">
          <ShieldCheck className="h-4 w-4" aria-hidden />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[13px] font-semibold tracking-tight truncate">EPADM CMS</div>
          <div className="text-[10px] uppercase tracking-wider text-danger">Platform Console</div>
        </div>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto" aria-label="Admin navigation">
        <ul className="space-y-0.5 list-none p-0 m-0">
          {items.map((item) => {
            const href = item.href;
            const isActive =
              !!href &&
              (pathname === href || (href !== "/admin" && pathname?.startsWith(href + "/")));
            const itemClass = cn(
              "w-full flex items-center gap-2 h-8 px-2 rounded-sm text-[12px] transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-foreground/80 hover:bg-muted/60",
              item.disabled && "opacity-45 pointer-events-none cursor-not-allowed",
            );

            return (
              <li key={item.label} className="list-none">
                {href && !item.disabled ? (
                  <Link href={href} className={itemClass}>
                    {item.icon && (
                      <span className="h-4 w-4 shrink-0 opacity-90">{item.icon}</span>
                    )}
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && <span className="ml-auto">{item.badge}</span>}
                  </Link>
                ) : (
                  <span className={itemClass} aria-disabled="true" title="Coming soon">
                    {item.icon && (
                      <span className="h-4 w-4 shrink-0 opacity-90">{item.icon}</span>
                    )}
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && <span className="ml-auto">{item.badge}</span>}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {(operatorName || operatorEmail) && (
        <div className="border-t p-2 shrink-0 space-y-2">
          <div className="px-2 space-y-0.5 min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-danger">
              Operator
            </div>
            {operatorName && (
              <div className="text-[12px] font-semibold text-foreground truncate">{operatorName}</div>
            )}
            {operatorEmail && (
              <div className="text-[11px] text-muted-foreground truncate">{operatorEmail}</div>
            )}
          </div>
          <button
            onClick={activeSignOut}
            className="w-full flex items-center justify-center rounded-sm border bg-surface hover:bg-muted/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            type="button"
          >
            Sign Out
          </button>
        </div>
      )}

      <div className="border-t p-2 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 h-8 px-2 rounded-sm text-[11px] text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          <ChevronRight className="h-3 w-3 rotate-180" aria-hidden />
          Exit to marketing site
        </Link>
      </div>
    </aside>
  );
});

export default AdminSidebar;
export const AdminSidebarStyles = () => null;
