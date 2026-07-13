import type { ReactNode } from "react";
import { getPlatformCtx } from "@/lib/platform/context";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

type Props = { children: ReactNode };

export default async function AdminLayout({ children }: Props) {
  let ctx: Awaited<ReturnType<typeof getPlatformCtx>> | null = null;

  try {
    ctx = await getPlatformCtx();
  } catch {
    ctx = null;
  }

  // Unauthenticated (e.g. /admin/login): no operator shell, but still own the
  // single <main id="main-content"> so the global skip-link resolves.
  if (!ctx) {
    return (
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    );
  }

  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/tenants", label: "Tenants" },
  ];

  return (
    <div className="admin-theme admin-layout-wrapper min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <AdminSidebar
          items={navItems}
          operatorName={ctx.name}
          operatorEmail={ctx.email}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 md:px-8 lg:px-10 admin-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
