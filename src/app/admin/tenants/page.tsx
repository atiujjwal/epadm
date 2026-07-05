import { listTenants } from "@/lib/platform/tenants";
import { ProvisionTenantForm } from "./provision-tenant-form";
import { TenantsTable } from "./tenants-table";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const { tenants } = await listTenants({ pageSize: 50 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-950">Tenants</h1>
          <p className="mt-2 text-sm text-zinc-600">
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
