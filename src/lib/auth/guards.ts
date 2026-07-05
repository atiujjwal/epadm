import type { Permission, UserRole } from "@/lib/db";
import { getCtx } from "@/lib/context";
import { hasPermission } from "./permissions";

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const ctx = await getCtx();

  if (!allowedRoles.includes(ctx.role)) {
    throw new Error(`Forbidden for role: ${ctx.role}`);
  }

  return ctx;
}

export async function requirePermission(permission: Permission) {
  const ctx = await getCtx();

  if (!hasPermission(ctx.role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }

  return ctx;
}
