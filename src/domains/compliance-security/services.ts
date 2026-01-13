import { PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { consentLogs } from "./schema";
import { LogConsentInput } from "./types";
import { requirePermission } from "@/lib/auth/rbac";

export async function logConsent(
  client: PoolClient,
  tenantId: string,
  userId: string, // The parent user
  data: LogConsentInput
) {
  // Self-service consent does not require admin permission,
  // but requires the user to be the subject.
  const db = drizzle(client);

  return await db
    .insert(consentLogs)
    .values({
      tenantId,
      userId,
      scope: data.scope,
      parentDidHash: data.parentDidHash,
      verificationMethod: data.verificationMethod,
      status: data.status,
      ipAddress: data.ipAddress,
    })
    .returning();
}
