import { listTenants } from "@/lib/platform/tenants";
import { TenantsTable } from "./tenants-table";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const { tenants } = await listTenants({ pageSize: 50 });

  return (
    <TenantsTable
      initialRows={tenants.map((tenant) => ({
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
      }))}
    />
  );
}
