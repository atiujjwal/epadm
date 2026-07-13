"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface NavGroup {
  /** Optional section heading. Omit for an ungrouped block (e.g. Overview). */
  label?: string;
  items: NavItem[];
}

export interface TenantSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Grouped navigation (preferred). Rendered as labelled sections. */
  groups?: NavGroup[];
  /** Flat navigation (legacy). Used when `groups` is not provided. */
  items?: NavItem[];
  tenantName?: string;
  tenantSlug?: string;
  userRole?: string;
  planTier?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * EPADM Tenant Sidebar
 *
 * Persistent, grouped navigation for the authenticated tenant workspace. Sign-out
 * lives in the top app bar (see AppTopbar), so the sidebar footer only surfaces
 * the active workspace context.
 *
 * @example
 * <TenantSidebar
 *   groups={[
 *     { items: [{ label: "Dashboard", href: "/dashboard", icon: <Icon /> }] },
 *     { label: "People", items: [{ label: "Students", href: "/students", icon: <Icon /> }] },
 *   ]}
 *   tenantName="Springfield Public School"
 *   userRole="admin"
 * />
 */
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
  const combinedClasses = ["tenant-sidebar", className].filter(Boolean).join(" ");

  // Prefer grouped nav; fall back to a single unlabelled group for legacy `items`.
  const resolvedGroups: NavGroup[] = groups ?? [{ items }];

  function isActive(href: string): boolean {
    return pathname === href || (pathname?.startsWith(href + "/") ?? false);
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="tenant-sidebar-overlay"
        data-mobile-open={mobileOpen}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        ref={ref}
        id="tenant-sidebar"
        className={combinedClasses}
        data-mobile-open={mobileOpen}
        {...rest}
      >
        <div className="tenant-sidebar__brand">
          <div className="tenant-sidebar__logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="14" height="2.5" rx="1.25" fill="var(--color-white)" />
              <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="var(--color-white)" />
              <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="var(--color-white)" />
              <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="var(--color-white)" />
              <circle cx="24" cy="24" r="4" fill="var(--color-white)" opacity="0.55" />
              <circle cx="24" cy="24" r="2" fill="var(--color-white)" />
            </svg>
          </div>
          <div className="tenant-sidebar__brand-text">
            <span className="tenant-sidebar__brand-label">EPADM</span>
            <span className="tenant-sidebar__brand-title">
              {tenantName ?? "Tenant Operations"}
            </span>
          </div>
        </div>

        <nav className="tenant-sidebar__nav" aria-label="Tenant navigation">
          {resolvedGroups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`} className="tenant-sidebar__group">
              {group.label && (
                <p className="tenant-sidebar__group-label">{group.label}</p>
              )}
              <ul className="tenant-sidebar__list">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href} className="tenant-sidebar__item">
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        aria-current={active ? "page" : undefined}
                        className={`tenant-sidebar__link ${active ? "tenant-sidebar__link--active" : ""}`}
                      >
                        {item.icon && <span className="tenant-sidebar__link-icon">{item.icon}</span>}
                        <span className="tenant-sidebar__link-label">{item.label}</span>
                        {item.badge && <span className="tenant-sidebar__link-badge">{item.badge}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {(tenantSlug || userRole || planTier) && (
          <div className="tenant-sidebar__context">
            <div className="tenant-sidebar__context-label">Active workspace</div>
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
          </div>
        )}
      </aside>
    </>
  );
});

export default TenantSidebar;

// Styles are consolidated into global CSS; kept as a no-op for the layout
// barrel's renderLayoutStyles() helper (backward compatibility).
export const TenantSidebarStyles = () => null;
