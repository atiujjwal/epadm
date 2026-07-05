import { jwtVerify, SignJWT } from "jose";
import type { PlanTier, UserRole } from "@/lib/db";

type SessionPayload = {
  tenantId: string;
  userId: string;
  role: UserRole;
  planTier: PlanTier;
};

const rawSecret = process.env.AUTH_SECRET ?? process.env.JWT_SECRET;

if (!rawSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[auth] AUTH_SECRET or JWT_SECRET must be set in production.",
    );
  }

  console.warn(
    "[auth] AUTH_SECRET/JWT_SECRET not set. Falling back to insecure dev secret.",
  );
}

const secret = new TextEncoder().encode(rawSecret ?? "dev-insecure-secret");

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24 * 7; // 7 days

  return new SignJWT({
    ...payload,
    iat: now,
    exp,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const tenantId = payload.tenantId as string | undefined;
    const userId = payload.userId as string | undefined;
    const role = payload.role as UserRole | undefined;
    const planTier = payload.planTier as PlanTier | undefined;

    if (!tenantId || !userId || !role || !planTier) {
      return null;
    }

    return { tenantId, userId, role, planTier };
  } catch (error) {
    console.warn("[auth] Failed to verify session token:", error);
    return null;
  }
}

