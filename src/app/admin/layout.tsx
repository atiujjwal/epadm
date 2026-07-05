import type { ReactNode } from "react";
import Link from "next/link";
import { getPlatformCtx } from "@/lib/platform/context";
import { PlatformSignOutButton } from "./platform-sign-out-button";

type Props = { children: ReactNode };

export default async function AdminLayout({ children }: Props) {
  let ctx: Awaited<ReturnType<typeof getPlatformCtx>> | null = null;

  try {
    ctx = await getPlatformCtx();
  } catch {
    ctx = null;
  }

  if (!ctx) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/tenants", label: "Tenants" },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#111827_18%,#f8fafc_18%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-0">
        <aside className="hidden w-72 border-r border-zinc-800/60 bg-zinc-950/95 px-5 py-6 text-white backdrop-blur md:block">
          <div className="rounded-2xl border border-amber-500/30 bg-zinc-900 px-4 py-5">
            <div className="text-xs uppercase tracking-[0.18em] text-amber-400">
              EPADM Ops
            </div>
            <div className="mt-2 text-xl font-semibold">Control plane</div>
            <div className="mt-2 text-sm text-zinc-400">
              Cross-tenant platform management with isolated credentials.
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Operator
            </div>
            <div className="mt-3 space-y-2">
              <div className="font-medium text-white">{ctx.name}</div>
              <div className="break-all text-zinc-400">{ctx.email}</div>
            </div>
            <div className="mt-4">
              <PlatformSignOutButton />
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
