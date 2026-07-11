import type { ReactNode } from "react";
import { getCtx } from "@/lib/context";
import { TenantClientLayout } from "./tenant-client-layout";

export default async function TenantLayout({ children }: { children: ReactNode }) {
  const ctx = await getCtx();

  if (ctx.role === "teacher" || ctx.role === "student") {
    return <>{children}</>;
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
