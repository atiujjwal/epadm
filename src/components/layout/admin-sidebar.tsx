"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

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

/**
 * EPADM Admin Sidebar Component
 *
 * Platform operator navigation sidebar with dark indigo theme.
 *
 * @example
 * <AdminSidebar
 *   items={[
 *     { label: "Overview", href: "/admin", icon: <HomeIcon /> },
 *     { label: "Tenants", href: "/admin/tenants", icon: <UsersIcon /> },
 *   ]}
 *   operatorName="Platform Admin"
 *   operatorEmail="admin@epadm.com"
 * />
 */
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

  const combinedClasses = ["admin-sidebar", className].filter(Boolean).join(" ");

  return (
    <>
      <AdminSidebarStyles />
      <aside ref={ref} className={combinedClasses} {...rest}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="14" height="2.5" rx="1.25" fill="var(--color-indigo-400)" />
              <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="var(--color-indigo-400)" />
              <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="var(--color-indigo-400)" />
              <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="var(--color-indigo-400)" />
              <circle cx="24" cy="24" r="4" fill="var(--color-indigo-300)" opacity="0.7" />
              <circle cx="24" cy="24" r="2" fill="var(--color-indigo-400)" />
            </svg>
          </div>
          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-label">EPADM Ops</span>
            <span className="admin-sidebar__brand-title">Control Plane</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          <ul className="admin-sidebar__list">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href} className="admin-sidebar__item">
                  <Link
                    href={item.href}
                    className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
                  >
                    {item.icon && <span className="admin-sidebar__link-icon">{item.icon}</span>}
                    <span className="admin-sidebar__link-label">{item.label}</span>
                    {item.badge && <span className="admin-sidebar__link-badge">{item.badge}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {(operatorName || operatorEmail) && (
          <div className="admin-sidebar__operator">
            <div className="admin-sidebar__operator-label">Operator</div>
            <div className="admin-sidebar__operator-info">
              {operatorName && <div className="admin-sidebar__operator-name">{operatorName}</div>}
              {operatorEmail && <div className="admin-sidebar__operator-email">{operatorEmail}</div>}
            </div>
            {onSignOut && (
              <button onClick={onSignOut} className="admin-sidebar__signout" type="button">
                Sign Out
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
});

const AdminSidebarStyles = () => (
  <style>{`
    .admin-sidebar {
      width: 17rem;
      min-height: 100vh;
      background: var(--color-navy-900);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      padding: var(--space-6) var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      flex-shrink: 0;
    }

    .admin-sidebar__brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding-bottom: var(--space-5);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .admin-sidebar__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(79, 110, 247, 0.15);
      border-radius: var(--radius-lg);
      flex-shrink: 0;
    }

    .admin-sidebar__brand-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .admin-sidebar__brand-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-widest);
      color: var(--color-indigo-300);
      line-height: 1;
    }

    .admin-sidebar__brand-title {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--color-white);
      line-height: 1.2;
    }

    .admin-sidebar__nav {
      flex: 1;
    }

    .admin-sidebar__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .admin-sidebar__item {
      display: flex;
    }

    .admin-sidebar__link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-2-5) var(--space-3);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-slate-300);
      text-decoration: none;
      border-radius: var(--radius-lg);
      transition:
        background-color var(--duration-fast) var(--ease-default),
        color var(--duration-fast) var(--ease-default);
    }

    .admin-sidebar__link:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--color-white);
    }

    .admin-sidebar__link--active {
      background: rgba(79, 110, 247, 0.2);
      color: var(--color-white);
    }

    .admin-sidebar__link-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--color-indigo-300);
      flex-shrink: 0;
    }

    .admin-sidebar__link--active .admin-sidebar__link-icon {
      color: var(--color-indigo-400);
    }

    .admin-sidebar__link-label {
      flex: 1;
    }

    .admin-sidebar__link-badge {
      font-size: var(--text-xs);
      padding: 2px var(--space-2);
      background: rgba(79, 110, 247, 0.2);
      color: var(--color-indigo-200);
      border-radius: var(--radius-full);
    }

    .admin-sidebar__operator {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-4);
      background: rgba(255, 255, 255, 0.04);
      border-radius: var(--radius-xl);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .admin-sidebar__operator-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-widest);
      color: var(--color-slate-400);
    }

    .admin-sidebar__operator-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .admin-sidebar__operator-name {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-white);
    }

    .admin-sidebar__operator-email {
      font-size: var(--text-xs);
      color: var(--color-slate-400);
      word-break: break-all;
    }

    .admin-sidebar__signout {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: var(--color-slate-400);
      background: none;
      border: none;
      padding: var(--space-2) 0;
      cursor: pointer;
      text-align: left;
      transition: color var(--duration-fast) var(--ease-default);
    }

    .admin-sidebar__signout:hover {
      color: var(--color-white);
    }
  `}</style>
);

export { AdminSidebarStyles };
export default AdminSidebar;