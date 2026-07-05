import { USER_ROLES } from "@/lib/db";
import { listTenantMembers } from "@/lib/admin/tenant-users";
import { getCtx } from "@/lib/context";
import { TenantUserManagement } from "./tenant-user-management";

export default async function TenantUsersPage() {
  const ctx = await getCtx();
  const members = await listTenantMembers(ctx.tenantId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Tenant users</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage school memberships and role assignments from one place.
        </p>
      </div>

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
