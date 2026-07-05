import { notFound } from "next/navigation";
import { getTenantDetail } from "@/lib/platform/tenants";
import { TenantControlPanel } from "./tenant-control-panel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ tenantId: string }> };

export default async function TenantDetailPage({ params }: Props) {
  const { tenantId } = await params;
  const detail = await getTenantDetail(tenantId);

  if (!detail) {
    notFound();
  }

  return (
    <TenantControlPanel
      tenantId={detail.tenant.id}
      slug={detail.tenant.slug}
      name={detail.tenant.name}
      isActive={detail.tenant.isActive}
      services={detail.services}
      metrics={detail.metrics.map((row) => ({
        logDate: String(row.logDate),
        activeUsers: row.activeUsers,
        totalAiTokens: row.totalAiTokens,
        dbStorageBytes: row.dbStorageBytes,
        computeCostInr: String(row.computeCostInr),
      }))}
    />
  );
}
