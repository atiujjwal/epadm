import "server-only";
import { forbidden } from "next/navigation";
import { getCtx } from "@/lib/context";
import { hasPermission } from "@/lib/auth/permissions";

export async function requireImportPermission() {
  const ctx = await getCtx();
  if (!hasPermission(ctx.role, "students.import") && !hasPermission(ctx.role, "hr.staff.import")) forbidden();
  return ctx;
}
