import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/guards";
import { tenants } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { PortalShell, StatGrid } from "../phase11-view";

export default async function DigitalExperiencePage() {
  const ctx = await requirePermission("digital-experience.configure");
  const [tenant] = await withTenant(ctx.tenantId, (tx) => tx.select({ settings: tenants.settings, logoUrl: tenants.logoUrl, name: tenants.name }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1));
  const settings = (tenant?.settings?.digital_experience ?? {}) as Record<string, unknown>;
  return <PortalShell title="Digital experience" description="Portal access, branding, notification channels, and communication policy."><StatGrid stats={[{ label: "Parent portal", value: settings.parentPortalEnabled === false ? "Disabled" : "Enabled" }, { label: "Student portal", value: settings.studentPortalEnabled === false ? "Disabled" : "Enabled" }, { label: "Brand", value: tenant?.name ?? "School" }, { label: "Logo", value: tenant?.logoUrl ? "Configured" : "Default" }]} /><div className="rounded-lg border bg-surface p-5 text-sm text-muted-foreground">Settings are stored in <code>tenants.settings.digital_experience</code>. Connect this page to the administration settings API when editable tenant JSON settings are expanded.</div></PortalShell>;
}
