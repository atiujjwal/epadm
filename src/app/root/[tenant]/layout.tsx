import type { ReactNode } from "react";
import { getCtx } from "@/lib/context";
import { TenantClientLayout } from "./tenant-client-layout";

export default async function TenantLayout({ children }: { children: ReactNode }) {
  const ctx = await getCtx();

  // Teacher and student portals render their own full-width page content and do
  // not (yet) use the admin sidebar shell. They still need the single
  // <main id="main-content"> so the global skip-link resolves and pages get
  // consistent gutters.
  if (ctx.role === "teacher" || ctx.role === "student") {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 lg:px-10"
      >
        {children}
      </main>
    );
  }

  return (
    <TenantClientLayout
      ctx={{
        role: ctx.role,
        tenantName: ctx.tenantName,
        tenantSlug: ctx.tenantSlug,
        planTier: ctx.planTier,
      }}
    >
      {children}
    </TenantClientLayout>
  );
}
