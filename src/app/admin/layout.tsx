import type { ReactNode } from "react";
import { getPlatformCtx } from "@/lib/platform/context";
import { PlatformSignOutButton } from "./platform-sign-out-button";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

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
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#0f172a_0%,#111827_18%,#f8fafc_18%)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <AdminSidebar
          items={navItems}
          operatorName={ctx.name}
          operatorEmail={ctx.email}
        />
        <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
