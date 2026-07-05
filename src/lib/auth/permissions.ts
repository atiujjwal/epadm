import type { Permission, UserRole } from "@/lib/db";
import { DEFAULT_ROLE_PERMISSIONS } from "./catalog";

export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return DEFAULT_ROLE_PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role].includes(permission);
}
