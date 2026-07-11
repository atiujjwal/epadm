import { listTenants } from "@/lib/platform/tenants";
import { ProvisionTenantForm } from "./provision-tenant-form";
import { TenantsTable } from "./tenants-table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const { tenants } = await listTenants({ pageSize: 50 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="accent" className="mb-2">Platform Admin</Badge>
          <h1 className="text-3xl font-semibold text-white">Tenants</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Master registry of all schools on the platform.
          </p>
        </div>
        <ProvisionTenantForm />
      </div>

      <TenantsTable
        initialRows={tenants.map((tenant) => ({
          ...tenant,
          createdAt: tenant.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
