import { PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { tenantUsers, roles } from "@/domains/identity-tenancy/schema";
import { eq, and } from "drizzle-orm";

export type Permission =
  | "attendance.read"
  | "attendance.write"
  | "exam.create"
  | "exam.publish"
  | "finance.view_revenue"
  | "student.pii_view"
  | "student.read"
  | "student.write"
  | "academic.read"
  | "academic.write"
  | "staff.read"
  | "staff.write"
  | "communication.broadcast"
  | "communication.chat"
  | "communication.read"
  | "communication.write"
  | "communication.notice.read"
  | "communication.notice.write"
  | "communication.message.read"
  | "communication.message.write"
  | "finance.manage_fees"
  | "finance.collect_payment"
  | "finance.config.read"
  | "finance.config.write"
  | "finance.read"
  | "finance.write"
  | "finance.invoice.read"
  | "finance.invoice.write"
  | "finance.payment.read"
  | "finance.payment.write"
  | "finance.ledger.read"
  | "finance.ledger.write"
  | "users.manage";


export async function requirePermission(
  client: PoolClient,
  userId: string,
  permission: Permission
) {
  const db = drizzle(client);

  const result = await db
    .select({
      permissions: roles.permissions,
    })
    .from(tenantUsers)
    .innerJoin(roles, eq(tenantUsers.roleId, roles.id))
    .where(and(eq(tenantUsers.userId, userId), eq(tenantUsers.isActive, true)))
    .limit(1);

  if (!result.length) {
    throw new Error("Access Denied: User not active in this tenant");
  }

  const userPermissions = result[0].permissions as string[];

  if (userPermissions.includes("*") || userPermissions.includes(permission)) {
    return true;
  }

  throw new Error(`Access Denied: Missing permission '${permission}'`);
}
