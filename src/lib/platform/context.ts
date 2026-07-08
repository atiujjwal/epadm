import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { opsDb } from "@/lib/db/ops";
import { platformOperators } from "@/lib/db/schema";
import { verifyPlatformToken } from "@/lib/platform/auth/token";
import { touchPlatformSession } from "@/lib/platform/auth/session";

export type PlatformCtx = {
  operatorId: string;
  email: string;
  name: string;
  sessionId: string;
};

async function _getPlatformCtx(): Promise<PlatformCtx> {
  const h = await headers();
  const operatorId = h.get("x-platform-operator-id") ?? "";
  const email = h.get("x-platform-operator-email") ?? "";
  const sessionId = h.get("x-platform-session-id") ?? "";

  if (!operatorId || !email || !sessionId) {
    throw new Error("Missing platform operator context");
  }

  const liveOperatorId = await touchPlatformSession(sessionId, operatorId);
  if (!liveOperatorId || liveOperatorId !== operatorId) {
    throw new Error("Platform session expired or revoked");
  }

  const [operator] = await opsDb
    .select({
      id: platformOperators.id,
      email: platformOperators.email,
      name: platformOperators.name,
      isActive: platformOperators.isActive,
    })
    .from(platformOperators)
    .where(eq(platformOperators.id, operatorId))
    .limit(1);

  if (!operator?.isActive) {
    throw new Error("Platform operator inactive");
  }

  return {
    operatorId: operator.id,
    email: operator.email,
    name: operator.name,
    sessionId,
  };
}

export const getPlatformCtx = cache(_getPlatformCtx);

export async function requirePlatformOperator(): Promise<PlatformCtx> {
  return getPlatformCtx();
}

export async function resolvePlatformFromCookie(
  token: string | undefined,
): Promise<PlatformCtx | null> {
  if (!token) {
    return null;
  }

  const payload = await verifyPlatformToken(token);
  if (!payload) {
    return null;
  }

  const liveOperatorId = await touchPlatformSession(
    payload.sessionId,
    payload.operatorId,
  );
  if (!liveOperatorId || liveOperatorId !== payload.operatorId) {
    return null;
  }

  const [operator] = await opsDb
    .select({
      id: platformOperators.id,
      email: platformOperators.email,
      name: platformOperators.name,
      isActive: platformOperators.isActive,
    })
    .from(platformOperators)
    .where(eq(platformOperators.id, payload.operatorId))
    .limit(1);

  if (!operator?.isActive) {
    return null;
  }

  return {
    operatorId: operator.id,
    email: operator.email,
    name: operator.name,
    sessionId: payload.sessionId,
  };
}
