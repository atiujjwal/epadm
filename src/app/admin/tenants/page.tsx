import { listTenants } from "@/lib/platform/tenants";
import { ProvisionTenantForm } from "./provision-tenant-form";
import { TenantsTable } from "./tenants-table";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const { tenants } = await listTenants({ pageSize: 50 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Master registry of all schools on the platform."
        badge={<Badge variant="accent">Platform Admin</Badge>}
        action={<ProvisionTenantForm />}
      />

      <TenantsTable
        initialRows={tenants.map((tenant) => ({
          ...tenant,
          createdAt: tenant.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
