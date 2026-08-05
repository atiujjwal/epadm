import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/guards";
import { privacyErasureRequests } from "@/lib/db";
import { DATA_RETENTION_POLICY } from "@/lib/governance/retention";
import { withTenant } from "@/lib/rls";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function PrivacyGovernancePage() {
  const ctx = await requirePermission("administration.privacy.manage");
  const requests = await withTenant(ctx.tenantId, (tx) => tx
    .select()
    .from(privacyErasureRequests)
    .where(eq(privacyErasureRequests.tenantId, ctx.tenantId))
    .orderBy(desc(privacyErasureRequests.createdAt))
    .limit(50));

  const policies = Object.entries(DATA_RETENTION_POLICY).map(([key, policy]) => ({ key, ...policy }));

  return (
    <PortalShell title="Privacy & Data Governance" description="DPDP-aligned retention, data export, and student erasure workflows.">
      <SimpleTable rows={requests} empty="No erasure requests yet." columns={[
        { label: "Student", value: (row) => row.studentId },
        { label: "Status", value: (row) => <Status value={row.status} /> },
        { label: "Reason", value: (row) => row.reason },
        { label: "Created", value: (row) => row.createdAt.toLocaleString("en-IN") },
      ]} />

      <SimpleTable rows={policies} columns={[
        { label: "Record class", value: (row) => row.key.replace(/_/g, " ") },
        { label: "Retention", value: (row) => "years" in row ? `${row.years} years` : `${row.days} days` },
        { label: "Trigger", value: (row) => row.trigger },
        { label: "Flags", value: (row) => [("immutable" in row && row.immutable) ? "immutable" : null, ("elevated_delete" in row && row.elevated_delete) ? "elevated delete" : null].filter(Boolean).join(", ") || "-" },
      ]} />
    </PortalShell>
  );
}
