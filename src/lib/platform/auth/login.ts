import "server-only";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { opsDb, platformOperators } from "@/lib/db/ops";
import { verifyTotpCode } from "@/lib/platform/auth/mfa";
import {
  createMfaChallengeToken,
  createPlatformToken,
} from "@/lib/platform/auth/token";
import { createPlatformSession } from "@/lib/platform/auth/session";

export async function authenticatePlatformOperator(
  email: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const [operator] = await opsDb
    .select()
    .from(platformOperators)
    .where(eq(platformOperators.email, normalizedEmail))
    .limit(1);

  if (!operator || !operator.isActive) {
    return { ok: false as const, reason: "invalid_credentials" as const };
  }

  const valid = await argon2.verify(operator.passwordHash, password);
  if (!valid) {
    return { ok: false as const, reason: "invalid_credentials" as const };
  }

  if (operator.mfaEnabled && operator.totpSecret) {
    const mfaToken = await createMfaChallengeToken(operator.id);
    return {
      ok: true as const,
      requiresMfa: true as const,
      mfaToken,
      operator: {
        id: operator.id,
        email: operator.email,
        name: operator.name,
      },
    };
  }

  const sessionId = await createPlatformSession(operator.id);
  const token = await createPlatformToken({
    operatorId: operator.id,
    email: operator.email,
    sessionId,
  });

  return {
    ok: true as const,
    requiresMfa: false as const,
    token,
    operator: {
      id: operator.id,
      email: operator.email,
      name: operator.name,
    },
  };
}

export async function verifyPlatformMfa(mfaToken: string, code: string) {
  const { verifyMfaChallengeToken } = await import(
    "@/lib/platform/auth/token"
  );
  const operatorId = await verifyMfaChallengeToken(mfaToken);

  if (!operatorId) {
    return { ok: false as const, reason: "invalid_mfa_token" as const };
  }

  const [operator] = await opsDb
    .select()
    .from(platformOperators)
    .where(eq(platformOperators.id, operatorId))
    .limit(1);

  if (!operator?.isActive || !operator.totpSecret) {
    return { ok: false as const, reason: "invalid_operator" as const };
  }

  const valid = await verifyTotpCode(operator.totpSecret, code);
  if (!valid) {
    return { ok: false as const, reason: "invalid_code" as const };
  }

  const sessionId = await createPlatformSession(operator.id);
  const token = await createPlatformToken({
    operatorId: operator.id,
    email: operator.email,
    sessionId,
  });

  return {
    ok: true as const,
    token,
    operator: {
      id: operator.id,
      email: operator.email,
      name: operator.name,
    },
  };
}
