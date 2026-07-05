import "server-only";
import { opsDb, platformAuditLogs } from "@/lib/db/ops";

type WritePlatformAuditInput = {
  operatorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writePlatformAuditLog(
  input: WritePlatformAuditInput,
): Promise<void> {
  await opsDb.insert(platformAuditLogs).values({
    operatorId: input.operatorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });
}
