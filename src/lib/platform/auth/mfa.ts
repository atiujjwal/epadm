import { generateSecret, generateURI, verify } from "otplib";

const ISSUER = "EPADM Platform";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function getTotpUri(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

export async function verifyTotpCode(
  secret: string,
  code: string,
): Promise<boolean> {
  const result = await verify({ secret, token: code });
  return result.valid;
}
