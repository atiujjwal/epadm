"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { cn } from "@/lib/cn";

export interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  items?: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    badge?: ReactNode;
  }>;
  operatorName?: string;
  operatorEmail?: string;
  onSignOut?: () => void;
}

export const AdminSidebar = forwardRef<HTMLElement, AdminSidebarProps>(function AdminSidebar(props, ref) {
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
        "w-64 h-screen sticky top-0 left-0 bg-slate-950 text-white flex flex-col justify-between border-r border-slate-900 shrink-0",
        className
      )}
      {...rest}
    >
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-900 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="text-indigo-400">
            <rect x="4" y="6" width="14" height="2.5" rx="1.25" fill="currentColor" />
            <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="currentColor" />
            <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="currentColor" />
            <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="currentColor" />
            <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.7" />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase leading-none mb-0.5">EPADM Ops</span>
          <span className="text-sm font-semibold text-slate-200 truncate">Control Plane</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4" aria-label="Admin navigation">
        <ul className="space-y-1 list-none p-0 m-0">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href} className="list-none">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 text-slate-400 hover:text-slate-200 hover:bg-slate-900 group",
                    isActive && "text-indigo-400 bg-indigo-950/45 hover:bg-indigo-950/60 border-l-2 border-indigo-500 pl-2.5 rounded-l-none"
                  )}
                >
                  {item.icon && (
                    <span className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                  {item.badge && <span className="ml-auto">{item.badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {(operatorName || operatorEmail) && (
        <div className="p-4 border-t border-slate-900 bg-slate-950/60 shrink-0 space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Operator</div>
          <div className="space-y-0.5">
            {operatorName && <div className="text-xs font-semibold text-slate-200 truncate">{operatorName}</div>}
            {operatorEmail && <div className="text-[11px] text-slate-500 truncate">{operatorEmail}</div>}
          </div>
          <button
            onClick={activeSignOut}
            className="w-full flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:text-white active:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-150 focus:outline-none"
            type="button"
          >
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
});

export default AdminSidebar;
export const AdminSidebarStyles = () => null;