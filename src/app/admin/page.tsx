import { getPlatformCtx } from "@/lib/platform/context";
import { getPlatformOverview } from "@/lib/platform/tenants";
import { PlatformMetricsChart } from "./platform-metrics-chart";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const ctx = await getPlatformCtx();
  const overview = await getPlatformOverview();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-medium text-amber-400">Platform status</div>
        <h1 className="mt-1 text-3xl font-semibold text-white">
          Welcome back, {ctx.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          Infrastructure cost vs API throughput across all schools. Sessions
          expire after 15 minutes and require sliding Redis validation.
        </p>
      </div>

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

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">
          AI token throughput (14 days)
        </h2>
        <div className="mt-4">
          <PlatformMetricsChart data={overview.recentMetrics ?? []} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-950">{value}</div>
    </div>
  );
}
