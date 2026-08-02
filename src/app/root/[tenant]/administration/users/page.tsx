import { listTenantMembers } from "@/lib/admin/tenant-users";
import { USER_ROLES } from "@/lib/auth/catalog";
import { requirePermission } from "@/lib/auth/guards";
import { AdminWorkspace } from "../../admin/admin-workspace";

export default async function AdminPage() {
  const ctx = await requirePermission("administration.users.read");
  const members = await listTenantMembers(ctx.tenantId);

  return (
    <AdminWorkspace
      initialMembers={members}
      roleOptions={USER_ROLES}
    />
  );
}
