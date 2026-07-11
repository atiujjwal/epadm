"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { TenantSidebar } from "@/components/layout/tenant-sidebar";

type Props = {
  children: ReactNode;
  ctx: {
    role: string;
    tenantName: string;
    tenantSlug: string;
    planTier: string;
  };
};

export function TenantClientLayout({ children, ctx }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (ctx.role === "teacher" || ctx.role === "student") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/users", label: "Tenant users" },
    { href: "/students", label: "Students" },
    { href: "/staff", label: "Staff" },
    { href: "/academics", label: "Academics" },
  ];

  if (ctx.role === "admin" || ctx.role === "accountant") {
    navItems.push({ href: "/finance", label: "Finance" });
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Mobile header */}
      <header
        className="md:hidden sticky top-0 z-[200] px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg" style={{ transition: 'background 0.15s' }}
            aria-label="Open navigation menu"
            aria-controls="tenant-sidebar"
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-primary">Tenant Operations</span>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <TenantSidebar
          items={navItems}
          tenantName={ctx.tenantName}
          tenantSlug={ctx.tenantSlug}
          userRole={ctx.role}
          planTier={ctx.planTier}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
