"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, HTMLAttributes, ReactNode, useState } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export interface TenantSidebarProps extends HTMLAttributes<HTMLElement> {
  items?: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    badge?: ReactNode;
  }>;
  tenantName?: string;
  tenantSlug?: string;
  userRole?: string;
  planTier?: string;
  onSignOut?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * EPADM Tenant Sidebar Component
 *
 * School tenant navigation sidebar with light theme and indigo accents.
 *
 * @example
 * <TenantSidebar
 *   items={[
 *     { label: "Dashboard", href: "/dashboard", icon: <HomeIcon /> },
 *     { label: "Users", href: "/users", icon: <UsersIcon /> },
 *     { label: "Students", href: "/students", icon: <GraduationIcon /> },
 *   ]}
 *   tenantName="Springfield Public School"
 *   userRole="admin"
 * />
 */
export const TenantSidebar = forwardRef<HTMLElement, TenantSidebarProps>(function TenantSidebar(props, ref) {
  const {
    items = [],
    tenantName,
    tenantSlug,
    userRole,
    planTier,
    onSignOut,
    className = "",
    mobileOpen = false,
    onMobileClose,
    ...rest
  } = props;

  const pathname = usePathname();
  const router = useRouter();

  async function handleDefaultSignOut() {
    await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const activeSignOut = onSignOut || handleDefaultSignOut;
  const combinedClasses = ["tenant-sidebar", className].filter(Boolean).join(" ");

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="tenant-sidebar-overlay"
        data-mobile-open={mobileOpen}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside ref={ref} className={combinedClasses} data-mobile-open={mobileOpen} {...rest}>
      <div className="tenant-sidebar__brand">
        <div className="tenant-sidebar__logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="4" y="6" width="14" height="2.5" rx="1.25" fill="var(--color-indigo-500)" />
            <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="var(--color-indigo-500)" />
            <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="var(--color-indigo-500)" />
            <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="var(--color-indigo-500)" />
            <circle cx="24" cy="24" r="4" fill="var(--color-indigo-300)" opacity="0.7" />
            <circle cx="24" cy="24" r="2" fill="var(--color-indigo-500)" />
          </svg>
        </div>
        <div className="tenant-sidebar__brand-text">
          <span className="tenant-sidebar__brand-label">EPADM</span>
          <span className="tenant-sidebar__brand-title">Tenant Operations</span>
        </div>
      </div>

      <nav className="tenant-sidebar__nav" aria-label="Tenant navigation">
        <ul className="tenant-sidebar__list">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href} className="tenant-sidebar__item">
                <Link
                  href={item.href}
                  className={`tenant-sidebar__link ${isActive ? "tenant-sidebar__link--active" : ""}`}
                >
                  {item.icon && <span className="tenant-sidebar__link-icon">{item.icon}</span>}
                  <span className="tenant-sidebar__link-label">{item.label}</span>
                  {item.badge && <span className="tenant-sidebar__link-badge">{item.badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {(tenantName || tenantSlug || userRole) && (
        <div className="tenant-sidebar__context">
          <div className="tenant-sidebar__context-label">Active Context</div>
          <div className="tenant-sidebar__context-grid">
            {userRole && (
              <div className="tenant-sidebar__context-item">
                <span className="tenant-sidebar__context-key">Role</span>
                <span className="tenant-sidebar__context-value">{userRole}</span>
              </div>
            )}
            {planTier && (
              <div className="tenant-sidebar__context-item">
                <span className="tenant-sidebar__context-key">Plan</span>
                <span className="tenant-sidebar__context-value">{planTier}</span>
              </div>
            )}
            {tenantSlug && (
              <div className="tenant-sidebar__context-item">
                <span className="tenant-sidebar__context-key">Slug</span>
                <span className="tenant-sidebar__context-value tenant-sidebar__context-value--mono">{tenantSlug}</span>
              </div>
            )}
          </div>
          <button onClick={activeSignOut} className="tenant-sidebar__signout" type="button">
            Sign Out
          </button>
        </div>
      )}
      </aside>
    </>
  );
});

// Styles are now consolidated into global CSS
const TenantSidebarStyles = () => null;

export { TenantSidebarStyles };
export default TenantSidebar;