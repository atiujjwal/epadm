import type { ReactNode } from "react";
import { and, desc, eq } from "drizzle-orm";
import { ShellClient } from "@/components/shell/shell-client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { getCtx } from "@/lib/context";
import { academicYears, tenantUsers, tenants, users } from "@/lib/db";
import { getAuthorizedNavigation, getRoleHomePath, toClientRoute } from "@/lib/navigation/route-registry";
import { withTenant } from "@/lib/rls";

const CORE_ENTITLEMENTS = ["module.students"];

export async function AppShell({ children }: { children: ReactNode }) {
  const ctx = await getCtx();
  const shellData = await withTenant(ctx.tenantId, async (tx) => {
    const [tenantRows, yearRows, userRows] = await Promise.all([
      tx
        .select({ logoUrl: tenants.logoUrl })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1),
      tx
        .select({ name: academicYears.name, isCurrent: academicYears.isCurrent })
        .from(academicYears)
        .where(eq(academicYears.tenantId, ctx.tenantId))
        .orderBy(desc(academicYears.startDate)),
      tx
        .select({ name: users.name })
        .from(tenantUsers)
        .innerJoin(users, eq(tenantUsers.userId, users.id))
        .where(
          and(
            eq(tenantUsers.tenantId, ctx.tenantId),
            eq(tenantUsers.userId, ctx.userId),
          ),
        )
        .limit(1),
    ]);

    return {
      logoUrl: tenantRows[0]?.logoUrl ?? null,
      years: yearRows,
      userName: userRows[0]?.name ?? ctx.role,
    };
  });

  const entitlements = Array.from(
    new Set([...CORE_ENTITLEMENTS, ...ctx.activeModules]),
  );
  const authorizedRoutes = getAuthorizedNavigation(
    DEFAULT_ROLE_PERMISSIONS[ctx.role],
    entitlements,
  ).map((route) =>
    route.key === "workspace.home"
      ? { ...route, path: getRoleHomePath(ctx.role) }
      : route,
  ).map(toClientRoute);
  const activeAcademicYear =
    shellData.years.find((year) => year.isCurrent)?.name ??
    shellData.years[0]?.name ??
    "Not configured";

  return (
    <ShellClient
      session={{
        tenantId: ctx.tenantId,
        tenantName: ctx.tenantName,
        tenantSlug: ctx.tenantSlug,
        planTier: ctx.planTier,
        primaryRole: ctx.role,
        userId: ctx.userId,
        userName: shellData.userName,
        logoUrl: shellData.logoUrl,
      }}
      authorizedRoutes={authorizedRoutes}
      activeAcademicYear={activeAcademicYear}
      academicYears={shellData.years.map((year) => year.name)}
    >
      {children}
    </ShellClient>
  );
}
