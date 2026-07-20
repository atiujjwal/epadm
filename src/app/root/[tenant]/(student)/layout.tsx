import type { ReactNode } from "react";
import Link from "next/link";
import { getCtx } from "@/lib/context";
import { TenantSignOutButton } from "../tenant-sign-out-button";

type Props = {
  children: ReactNode;
};

export default async function StudentLayout({ children }: Props) {
  const ctx = await getCtx();
  const navItems = [
    { href: "/student/home", label: "Dashboard" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-0">
        <aside className="hidden w-[220px] border-r px-3 py-4 md:block" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <div className="rounded-md border border-[#e3e5e9] bg-white px-3 py-3">
            <div className="text-[10px] font-semibold uppercase text-[#626874]">
              EPADM Portal
            </div>
            <div className="mt-1 text-sm font-semibold text-[#2d3442]">Student hub</div>
            <div className="mt-2 text-xs text-[#626874]">
              View your dashboard, grades, and upcoming assignments.
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-md px-3 py-2 text-xs font-medium text-secondary transition hover:bg-[#edf1fd] hover:text-[#31477f]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 rounded-md border px-3 py-3 text-xs text-secondary" style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}>
            <div className="text-[10px] font-semibold uppercase text-[#626874]">
              Active context
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

        <main className="flex-1 px-4 py-4 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
