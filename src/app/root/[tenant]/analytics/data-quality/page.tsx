import { requirePermission } from "@/lib/auth/guards";
import { computeDataQuality } from "@/lib/phase12/analytics";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function DataQualityPage() {
  const ctx = await requirePermission("analytics.read");
  const issues = await computeDataQuality(ctx.tenantId);
  return (
    <PortalShell title="Data Quality" description="Operational gaps that reduce analytics, reports, portal, and AI quality.">
      <SimpleTable rows={issues} columns={[
        { label: "Check", value: (row) => row.label },
        { label: "Owner", value: (row) => row.owner },
        { label: "Count", value: (row) => row.count },
        { label: "Severity", value: (row) => <Status value={row.severity} /> },
      ]} />
    </PortalShell>
  );
}
