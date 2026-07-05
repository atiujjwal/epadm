import "server-only";
import { jwtVerify, SignJWT } from "jose";

export type PlatformSessionPayload = {
  operatorId: string;
  email: string;
  scope: "platform";
  sessionId: string;
};

const PLATFORM_TOKEN_TTL_SECONDS = 15 * 60;

const rawSecret =
  process.env.PLATFORM_AUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.JWT_SECRET;

if (!rawSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[platform-auth] PLATFORM_AUTH_SECRET or AUTH_SECRET must be set in production.",
    );
  }
  console.warn(
    "[platform-auth] No secret configured. Falling back to insecure dev secret.",
  );
}

const secret = new TextEncoder().encode(
  rawSecret ?? "dev-platform-insecure-secret",
);

export async function createPlatformToken(
  payload: Omit<PlatformSessionPayload, "scope">,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    ...payload,
    scope: "platform",
    iat: now,
    exp: now + PLATFORM_TOKEN_TTL_SECONDS,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(secret);
}

export async function verifyPlatformToken(
  token: string,
): Promise<PlatformSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.scope !== "platform") {
      return null;
    }

    const operatorId = payload.operatorId as string | undefined;
    const email = payload.email as string | undefined;
    const sessionId = payload.sessionId as string | undefined;

    if (!operatorId || !email || !sessionId) {
      return null;
    }

    return { operatorId, email, scope: "platform", sessionId };
  } catch {
    return null;
  }
}

export async function createMfaChallengeToken(operatorId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    operatorId,
    purpose: "mfa_challenge",
    iat: now,
    exp: now + 5 * 60,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(secret);
}

export async function verifyMfaChallengeToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.purpose !== "mfa_challenge") {
      return null;
    }

    return (payload.operatorId as string) ?? null;
  } catch {
    return null;
  }
}

export const PLATFORM_COOKIE = "platform_auth_token";
export const PLATFORM_TOKEN_TTL = PLATFORM_TOKEN_TTL_SECONDS;
