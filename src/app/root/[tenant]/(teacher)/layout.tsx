import type { ReactNode } from "react";
import Link from "next/link";
import { getCtx } from "@/lib/context";
import { TenantSignOutButton } from "../tenant-sign-out-button";

type Props = {
  children: ReactNode;
};

export default async function TeacherLayout({ children }: Props) {
  const ctx = await getCtx();
  const navItems = [
    { href: "/teacher/home", label: "Dashboard" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-0">
        <aside className="hidden w-72 border-r px-5 py-6 backdrop-blur md:block" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <div className="rounded-2xl bg-sky-950 px-4 py-5 text-white shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-sky-300 font-semibold">
              EPADM Portal
            </div>
            <div className="mt-2 text-xl font-semibold text-white">Teacher Workspace</div>
            <div className="mt-2 text-xs text-sky-100">
              Manage classes, take attendance, and post assignments.
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-sky-50 hover:text-sky-800 text-secondary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border px-4 py-4 text-sm text-secondary" style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              Active Context
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-muted">Role</div>
                <div className="font-semibold text-primary capitalize">{ctx.role}</div>
              </div>
              <div>
                <div className="text-xs text-muted">User ID</div>
                <div className="break-all font-mono text-[11px] text-secondary">{ctx.userId}</div>
              </div>
            </div>
          </div>

          <TenantSignOutButton />
        </aside>

        <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
