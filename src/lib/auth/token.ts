import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-unsafe-secret"
);
const ALG = "HS256";

export async function createSessionToken(payload: {
  userId: string;
  tenantId: string;
  role: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; tenantId: string; role: string };
  } catch (err) {
    return null;
  }
}
