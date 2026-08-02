import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { auditLogs, customRoles, tenantIntegrations, tenantUsers } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export default async function AdministrationPage() {
  const ctx = await requirePermission("administration.read");
  const summary = await withTenant(ctx.tenantId, async (tx) => {
    const [[members], [roles], [events], [integrations]] = await Promise.all([
      tx.select({ value: count() }).from(tenantUsers).where(eq(tenantUsers.tenantId, ctx.tenantId)),
      tx.select({ value: count() }).from(customRoles).where(eq(customRoles.tenantId, ctx.tenantId)),
      tx.select({ value: count() }).from(auditLogs).where(eq(auditLogs.tenantId, ctx.tenantId)),
      tx.select({ value: count() }).from(tenantIntegrations).where(eq(tenantIntegrations.tenantId, ctx.tenantId)),
    ]);
    return { members: Number(members.value), roles: Number(roles.value), events: Number(events.value), integrations: Number(integrations.value) };
  });
  const cards = [
    ["Members", summary.members, "/administration/users"], ["Custom roles", summary.roles, "/administration/roles"],
    ["Audit events", summary.events, "/administration/audit"], ["Configured integrations", summary.integrations, "/administration/integrations"],
  ] as const;
  return <div className="space-y-6"><PageHeader title="Administration" description="School identity, access, integrations, and audit controls." />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, href]) => <Link key={label} href={href}><Card padding="lg" className="h-full"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></Card></Link>)}</div>
  </div>;
}
