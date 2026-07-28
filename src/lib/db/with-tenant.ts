import { assertTenantId, withTenant } from "@/lib/rls";

export { withTenant };
export type { TenantTransaction } from "@/lib/rls";

/**
 * Reads the tenant context injected by src/proxy.ts for an authenticated
 * request. The proxy strips caller-supplied identity headers before adding
 * trusted session values.
 */
export async function getTenantId(request: Request): Promise<string> {
  const tenantId = request.headers.get("x-tenant-id") ?? "";
  const userId = request.headers.get("x-user-id") ?? "";

  if (!tenantId || !userId) {
    throw new Error("No tenant context — unauthenticated or invalid session");
  }

  assertTenantId(tenantId);
  return tenantId;
}
