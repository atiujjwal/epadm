"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, HTMLAttributes, ReactNode, useState } from "react";

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
          {onSignOut && (
            <button onClick={onSignOut} className="tenant-sidebar__signout" type="button">
              Sign Out
            </button>
          )}
        </div>
      )}
      </aside>
    </>
  );
});

const TenantSidebarStyles = () => (
  <style>{`
    .tenant-sidebar {
      width: 17rem;
      min-height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-default);
      padding: var(--space-6) var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      flex-shrink: 0;
    }

    /* Mobile responsive - hidden on small screens, becomes drawer */
    @media (max-width: 768px) {
      .tenant-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--z-sticky);
        transform: translateX(-100%);
        transition: transform var(--duration-normal) var(--ease-default);
        width: 18rem;
        max-width: 85vw;
        box-shadow: var(--shadow-lg);
      }

      .tenant-sidebar[data-mobile-open="true"] {
        transform: translateX(0);
      }

      .tenant-sidebar-overlay {
        position: fixed;
        inset: 0;
        background: var(--bg-overlay);
        z-index: calc(var(--z-sticky) - 1);
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--duration-normal) var(--ease-default);
      }

      .tenant-sidebar-overlay[data-mobile-open="true"] {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .tenant-sidebar__brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding-bottom: var(--space-5);
      border-bottom: 1px solid var(--border-default);
    }

    .tenant-sidebar__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      background: var(--color-indigo-500);
      border-radius: var(--radius-lg);
      flex-shrink: 0;
    }

    .tenant-sidebar__brand-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tenant-sidebar__brand-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-widest);
      color: var(--color-indigo-400);
      line-height: 1;
    }

    .tenant-sidebar__brand-title {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      line-height: 1.2;
    }

    .tenant-sidebar__nav {
      flex: 1;
    }

    .tenant-sidebar__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .tenant-sidebar__item {
      display: flex;
    }

    .tenant-sidebar__link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-2-5) var(--space-3);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-lg);
      transition:
        background-color var(--duration-fast) var(--ease-default),
        color var(--duration-fast) var(--ease-default);
    }

    .tenant-sidebar__link:hover {
      background: var(--accent-subtle);
      color: var(--text-primary);
    }

    .tenant-sidebar__link--active {
      background: var(--color-indigo-50);
      color: var(--color-indigo-700);
    }

    .tenant-sidebar__link-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .tenant-sidebar__link--active .tenant-sidebar__link-icon {
      color: var(--color-indigo-600);
    }

    .tenant-sidebar__link-label {
      flex: 1;
    }

    .tenant-sidebar__link-badge {
      font-size: var(--text-xs);
      padding: 2px var(--space-2);
      background: var(--color-indigo-100);
      color: var(--color-indigo-700);
      border-radius: var(--radius-full);
    }

    .tenant-sidebar__context {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--bg-surface-2);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-default);
    }

    .tenant-sidebar__context-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-widest);
      color: var(--text-muted);
    }

    .tenant-sidebar__context-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .tenant-sidebar__context-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tenant-sidebar__context-key {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .tenant-sidebar__context-value {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }

    .tenant-sidebar__context-value--mono {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      word-break: break-all;
    }

    .tenant-sidebar__signout {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      background: none;
      border: none;
      padding: var(--space-2) 0;
      cursor: pointer;
      text-align: left;
      transition: color var(--duration-fast) var(--ease-default);
    }

    .tenant-sidebar__signout:hover {
      color: var(--text-primary);
    }
  `}</style>
);

export { TenantSidebarStyles };
export default TenantSidebar;