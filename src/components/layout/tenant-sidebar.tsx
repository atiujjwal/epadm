"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface TenantSidebarProps extends HTMLAttributes<HTMLElement> {
  groups?: NavGroup[];
  items?: NavItem[];
  tenantName?: string;
  tenantSlug?: string;
  userRole?: string;
  planTier?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const TenantSidebar = forwardRef<HTMLElement, TenantSidebarProps>(function TenantSidebar(props, ref) {
  const {
    groups,
    items = [],
    tenantName,
    tenantSlug,
    userRole,
    planTier,
    className = "",
    mobileOpen = false,
    onMobileClose,
    ...rest
  } = props;

  const pathname = usePathname();

  // Prefer grouped nav; fall back to a single unlabelled group for legacy `items`.
  const resolvedGroups: NavGroup[] = groups ?? [{ items }];

  function isActive(href: string): boolean {
    return pathname === href || (pathname?.startsWith(href + "/") ?? false);
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        ref={ref}
        id="tenant-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out border-r border-slate-800 lg:sticky lg:translate-x-0 lg:z-0 lg:h-screen lg:top-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        {...rest}
      >
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800/60 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white border border-blue-500/20">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="text-white">
              <rect x="4" y="6" width="14" height="2.5" rx="1.25" fill="currentColor" />
              <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="currentColor" />
              <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="currentColor" />
              <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="currentColor" />
              <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.55" />
              <circle cx="24" cy="24" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase leading-none mb-0.5">EPADM</span>
            <span className="text-sm font-semibold text-slate-200 truncate">
              {tenantName ?? "Tenant Operations"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-7" aria-label="Tenant navigation">
          {resolvedGroups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`} className="space-y-2">
              {group.label && (
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{group.label}</p>
              )}
              <ul className="space-y-1 list-none p-0 m-0">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href} className="list-none">
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 group",
                          active && "text-slate-100 bg-slate-800/80 hover:bg-slate-800 hover:text-white border-l-2 border-blue-500 pl-2.5 rounded-l-none"
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
            </div>
          ))}
        </nav>

        {(tenantSlug || userRole || planTier) && (
          <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 shrink-0 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active workspace</div>
            <div className="grid grid-cols-1 gap-2">
              {userRole && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Role</span>
                  <span className="font-semibold text-slate-300 capitalize">{userRole}</span>
                </div>
              )}
              {planTier && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-semibold text-slate-300 capitalize">{planTier}</span>
                </div>
              )}
              {tenantSlug && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Slug</span>
                  <span className="font-mono text-[11px] text-slate-400">{tenantSlug}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
});

export default TenantSidebar;
export const TenantSidebarStyles = () => null;
