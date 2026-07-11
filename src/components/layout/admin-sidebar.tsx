"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

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
  const router = useRouter();

  async function handleDefaultSignOut() {
    await fetchWithCsrf("/api/platform/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const activeSignOut = onSignOut || handleDefaultSignOut;
  const combinedClasses = ["admin-sidebar", className].filter(Boolean).join(" ");

  return (
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
            <button onClick={activeSignOut} className="admin-sidebar__signout" type="button">
              Sign Out
            </button>
          </div>
        )}
      </aside>
  );
});

// Styles are now consolidated into global CSS
const AdminSidebarStyles = () => null;

export { AdminSidebarStyles };
export default AdminSidebar;