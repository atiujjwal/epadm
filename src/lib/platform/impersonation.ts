import "server-only";

import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { auditLogs } from "@/lib/db";
import { opsDb, supportImpersonationSessions } from "@/lib/db/ops";
import { writePlatformAuditLog } from "@/lib/platform/audit";
import { withTenant } from "@/lib/rls";

const SUPPORT_SESSION_TTL_MS = 60 * 60 * 1000;

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSupportImpersonationSession(input: {
  operatorId: string;
  tenantId: string;
  targetUserId: string;
  reason: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SUPPORT_SESSION_TTL_MS);
  const [session] = await opsDb.insert(supportImpersonationSessions).values({
    operatorId: input.operatorId,
    tenantId: input.tenantId,
    targetUserId: input.targetUserId,
    reason: input.reason,
    tokenHash: tokenHash(token),
    expiresAt,
  }).returning();

  await writePlatformAuditLog({
    operatorId: input.operatorId,
    action: "support.impersonation.started",
    entityType: "tenant",
    entityId: input.tenantId,
    metadata: { targetUserId: input.targetUserId, reason: input.reason, sessionId: session.id, expiresAt: expiresAt.toISOString() },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  await withTenant(input.tenantId, (tx) => tx.insert(auditLogs).values({
    tenantId: input.tenantId,
    actorUserId: null,
    action: "support.impersonation.started",
    entityType: "user",
    entityId: input.targetUserId,
    metadata: { operatorId: input.operatorId, reason: input.reason, sessionId: session.id, expiresAt: expiresAt.toISOString() },
  }));

  return { token, session };
}

export async function validateSupportSession(token: string | undefined, tenantId: string) {
  if (!token) return null;
  const [session] = await opsDb
    .select()
    .from(supportImpersonationSessions)
    .where(and(
      eq(supportImpersonationSessions.tokenHash, tokenHash(token)),
      eq(supportImpersonationSessions.tenantId, tenantId),
      eq(supportImpersonationSessions.status, "active"),
    ))
    .limit(1);
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  return session;
}

export async function endSupportImpersonationSession(input: {
  token: string;
  operatorId?: string | null;
  tenantId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const [session] = await opsDb
    .update(supportImpersonationSessions)
    .set({ status: "ended", endedAt: new Date() })
    .where(eq(supportImpersonationSessions.tokenHash, tokenHash(input.token)))
    .returning();

  if (!session) return null;
  await writePlatformAuditLog({
    operatorId: input.operatorId ?? session.operatorId,
    action: "support.impersonation.ended",
    entityType: "tenant",
    entityId: session.tenantId,
    metadata: { targetUserId: session.targetUserId, sessionId: session.id },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return session;
}
