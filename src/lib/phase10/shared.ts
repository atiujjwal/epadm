import "server-only";

import { auditLogs } from "@/lib/db";
import type { Permission } from "@/lib/db";
import type { TenantTransaction } from "@/lib/rls";

export class Phase10Error extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);
  const maybe = error as { message?: unknown; code?: unknown; constraint?: unknown; detail?: unknown; cause?: unknown };
  return [
    typeof maybe.message === "string" ? maybe.message : "",
    typeof maybe.code === "string" ? maybe.code : "",
    typeof maybe.constraint === "string" ? maybe.constraint : "",
    typeof maybe.detail === "string" ? maybe.detail : "",
    maybe.cause ? errorText(maybe.cause) : "",
  ].filter(Boolean).join(" ");
}

export function phase10ApiError(error: unknown) {
  if (error instanceof Phase10Error) return Response.json({ error: error.message }, { status: error.status });
  if (/23505|duplicate key|unique constraint/i.test(errorText(error))) {
    return Response.json({ error: "A conflicting Phase 10 record already exists." }, { status: 409 });
  }
  return Response.json({ error: "Phase 10 request failed" }, { status: 500 });
}

export function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function decimal(value: string | number | null | undefined, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function decimalString(value: string | number, digits = 2) {
  return decimal(value).toFixed(digits);
}

export async function writeAuditLog(
  tx: TenantTransaction,
  input: {
    tenantId: string;
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  },
) {
  await tx.insert(auditLogs).values({
    tenantId: input.tenantId,
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
  });
}

export function hasHealthRecordAccess(permissions: readonly Permission[] | readonly string[]) {
  return permissions.includes("facilities.health.manage");
}
