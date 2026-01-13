import { NextRequest } from "next/server";

/**
 * Validates that the request originates from a trusted System Admin.
 * Uses a rotated API Key strategy independent of User RBAC.
 */
export function verifySuperAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const adminSecret = process.env.SUPER_ADMIN_KEY;

  if (!adminSecret) {
    console.error(
      "CRITICAL: SUPER_ADMIN_KEY is not set in environment variables."
    );
    throw new Error("Server Misconfiguration");
  }

  // Expect header: "Bearer <SUPER_ADMIN_KEY>"
  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    throw new Error("Unauthorized: Invalid System Credentials");
  }

  return true;
}
