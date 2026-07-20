import { listTenantMembers } from "@/lib/admin/tenant-users";
import { getCtx } from "@/lib/context";
import { USER_ROLES } from "@/lib/auth/catalog";
import { AdminWorkspace } from "./admin-workspace";

export default async function AdminPage() {
  const ctx = await getCtx();
  const members = await listTenantMembers(ctx.tenantId);

  return (
    <AdminWorkspace
      initialMembers={members}
      roleOptions={USER_ROLES}
    />
  );
}
