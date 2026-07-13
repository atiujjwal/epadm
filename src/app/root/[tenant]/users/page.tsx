import { USER_ROLES } from "@/lib/db";
import { listTenantMembers } from "@/lib/admin/tenant-users";
import { getCtx } from "@/lib/context";
import { PageHeader } from "@/components/layout/page-header";
import { TenantUserManagement } from "./tenant-user-management";

export default async function TenantUsersPage() {
  const ctx = await getCtx();
  const members = await listTenantMembers(ctx.tenantId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant users"
        description="Manage school memberships and role assignments from one place."
      />

      <TenantUserManagement
        initialMembers={members.map((member) => ({
          ...member,
          joinedAt: member.joinedAt.toISOString(),
        }))}
        roleOptions={USER_ROLES}
      />
    </div>
  );
}
