import type { ReactNode } from "react";
import Link from "next/link";
import { getCtx } from "@/lib/context";
import { TenantSignOutButton } from "./tenant-sign-out-button";

type Props = {
  children: ReactNode;
  params: { tenant: string };
};

export default async function TenantLayout({ children }: Props) {
  const ctx = await getCtx();

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6faf6_0%,#f8fafc_48%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-0">
        <aside className="hidden w-72 border-r border-zinc-200/80 bg-white/80 px-5 py-6 backdrop-blur md:block">
          <div className="rounded-2xl bg-zinc-950 px-4 py-5 text-white shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">
              EPADM
            </div>
            <div className="mt-2 text-xl font-semibold">Tenant operations</div>
            <div className="mt-2 text-sm text-zinc-300">
              Role-aware control surface for school administration.
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Active context
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-zinc-500">Role</div>
                <div className="font-medium text-zinc-950">{ctx.role}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Plan</div>
                <div className="font-medium text-zinc-950">{ctx.planTier}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">User</div>
                <div className="break-all font-medium text-zinc-950">{ctx.userId}</div>
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

