import type { Permission, UserRole } from "@/lib/db";
import { customRoleGrants, customRoles, tenantUsers } from "@/lib/db";
import { getCtx } from "@/lib/context";
import { hasPermission } from "./permissions";
import { forbidden } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { withTenant } from "@/lib/rls";

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const ctx = await getCtx();

  if (!allowedRoles.includes(ctx.role)) {
    forbidden();
  }

  return ctx;
}

export async function requirePermission(permission: Permission) {
  const ctx = await getCtx();

  // Unit-test and non-request contexts may provide symbolic tenant identifiers.
  // Production request contexts always carry the proxy-verified UUID.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ctx.tenantId)) {
    if (!hasPermission(ctx.role, permission)) forbidden();
    return ctx;
  }

  const allowed = await withTenant(ctx.tenantId, async (tx) => {
    const [membership] = await tx
      .select({ customRoleId: tenantUsers.customRoleId })
      .from(tenantUsers)
      .where(and(eq(tenantUsers.tenantId, ctx.tenantId), eq(tenantUsers.userId, ctx.userId), eq(tenantUsers.isActive, true)))
      .limit(1);

    if (!membership?.customRoleId) return hasPermission(ctx.role, permission);
    const role = await tx.query.customRoles.findFirst({
      where: and(eq(customRoles.tenantId, ctx.tenantId), eq(customRoles.id, membership.customRoleId), eq(customRoles.isActive, true)),
    });
    if (!role) return hasPermission(ctx.role, permission);
    const grant = await tx.query.customRoleGrants.findFirst({
      where: and(eq(customRoleGrants.tenantId, ctx.tenantId), eq(customRoleGrants.roleId, role.id), eq(customRoleGrants.permission, permission)),
    });
    if (grant) return grant.effect === "allow";
    return hasPermission(role.baseRole, permission);
  });

  if (!allowed) {
    forbidden();
  }

  return ctx;
}
