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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdf4ff_0%,#f8fafc_48%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-0">
        <aside className="hidden w-72 border-r border-zinc-200/80 bg-white/80 px-5 py-6 backdrop-blur md:block">
          <div className="rounded-2xl bg-fuchsia-950 px-4 py-5 text-white shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-fuchsia-300 font-semibold">
              EPADM Portal
            </div>
            <div className="mt-2 text-xl font-semibold text-white">Student Hub</div>
            <div className="mt-2 text-xs text-fuchsia-100">
              View your dashboard, grades, and upcoming assignments.
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-fuchsia-50 hover:text-fuchsia-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-fuchsia-50/50 px-4 py-4 text-sm text-zinc-700">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-700">
              Active Context
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-zinc-500">Role</div>
                <div className="font-semibold text-zinc-950 capitalize">{ctx.role}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">User ID</div>
                <div className="break-all font-mono text-[11px] text-zinc-800">{ctx.userId}</div>
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
