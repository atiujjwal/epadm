import type { Permission, UserRole } from "@/lib/db";
import { getCtx } from "@/lib/context";
import { hasPermission } from "./permissions";
import { forbidden } from "next/navigation";

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const ctx = await getCtx();

  if (!allowedRoles.includes(ctx.role)) {
    forbidden();
  }

  return ctx;
}

export async function requirePermission(permission: Permission) {
  const ctx = await getCtx();

  if (!hasPermission(ctx.role, permission)) {
    forbidden();
  }

  return ctx;
}
