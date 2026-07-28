import { eq } from "drizzle-orm";
import { forbidden } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { getCtx } from "@/lib/context";
import { users } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { ProfileForm } from "./profile-form";

export default async function MyProfilePage() {
  const ctx = await getCtx();
  const profile = await withTenant(ctx.tenantId, async (tx) => {
    const rows = await tx
      .select({ name: users.name, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);
    return rows[0];
  });
  if (!profile) forbidden();

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="My profile" description="Manage your own account details." />
      <ProfileForm profile={{ ...profile, phone: profile.phone ?? "" }} />
    </div>
  );
}
