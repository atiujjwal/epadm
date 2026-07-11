import { getPlatformCtx } from "@/lib/platform/context";
import { getPlatformOverview } from "@/lib/platform/tenants";
import { PlatformMetricsChart } from "./platform-metrics-chart";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const ctx = await getPlatformCtx();
  const overview = await getPlatformOverview();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${ctx.name}`}
        description="Infrastructure cost vs API throughput across all schools. Sessions expire after 15 minutes and require sliding Redis validation."
        badge={<Badge variant="accent">Platform active</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total tenants"
          value={String(overview.tenantStats?.total ?? 0)}
        />
        <StatCard
          label="Active tenants"
          value={String(overview.tenantStats?.active ?? 0)}
        />
        <StatCard
          label="AI tokens (30d)"
          value={String(overview.metricStats?.totalTokens ?? 0)}
        />
        <StatCard
          label="Compute cost INR (30d)"
          value={Number(overview.metricStats?.totalCost ?? 0).toFixed(2)}
        />
      </div>

      <Card variant="default" padding="lg">
        <h2 className="text-lg font-semibold text-primary">
          AI token throughput (14 days)
        </h2>
        <div className="mt-4">
          <PlatformMetricsChart data={overview.recentMetrics ?? []} />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="default" padding="md">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-primary">{value}</div>
    </Card>
  );
}
