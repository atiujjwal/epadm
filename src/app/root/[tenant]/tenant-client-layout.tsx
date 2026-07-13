"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { TenantSidebar, type NavGroup } from "@/components/layout/tenant-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

type Props = {
  children: ReactNode;
  ctx: {
    role: string;
    tenantName: string;
    tenantSlug: string;
    planTier: string;
  };
};

/* ── Nav icons (20px, stroke, currentColor) ─────────────────────── */
const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const DashboardIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
const UsersIcon = () => (
  <svg {...iconProps}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const StudentsIcon = () => (
  <svg {...iconProps}>
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
  </svg>
);
const StaffIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const AcademicsIcon = () => (
  <svg {...iconProps}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const FinanceIcon = () => (
  <svg {...iconProps}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export function TenantClientLayout({ children, ctx }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Grouped, role-aware navigation. Hrefs are preserved from the previous flat
  // nav so existing links keep working; grouping and icons are additive.
  const groups: NavGroup[] = [
    {
      items: [{ href: "/dashboard", label: "Overview", icon: <DashboardIcon /> }],
    },
    {
      label: "People",
      items: [
        { href: "/users", label: "Users", icon: <UsersIcon /> },
        { href: "/students", label: "Students", icon: <StudentsIcon /> },
        { href: "/staff", label: "Staff", icon: <StaffIcon /> },
      ],
    },
    {
      label: "Academics",
      items: [{ href: "/academics", label: "Structure", icon: <AcademicsIcon /> }],
    },
  ];

  if (ctx.role === "admin" || ctx.role === "accountant") {
    groups.push({
      label: "Finance",
      items: [{ href: "/finance", label: "Fees & payroll", icon: <FinanceIcon /> }],
    });
  }

  return (
    <div className="app-shell">
      <TenantSidebar
        groups={groups}
        tenantName={ctx.tenantName}
        tenantSlug={ctx.tenantSlug}
        userRole={ctx.role}
        planTier={ctx.planTier}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="app-shell__main">
        <AppTopbar
          workspaceName={ctx.tenantName}
          userRole={ctx.role}
          onOpenNav={() => setMobileOpen(true)}
          navOpen={mobileOpen}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="app-shell__content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
