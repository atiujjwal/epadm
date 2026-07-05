import type { InferInsertModel } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { auditLogs } from "@/lib/db";
import type * as schema from "@/lib/db/schema";

type AuditInsert = InferInsertModel<typeof auditLogs>;
type DatabaseLike = NodePgDatabase<typeof schema>;

export async function writeAuditLog(
  db: DatabaseLike,
  entry: Omit<AuditInsert, "id" | "createdAt">,
) {
  await db.insert(auditLogs).values(entry);
}
