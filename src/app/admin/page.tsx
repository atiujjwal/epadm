import { getPlatformOverview, listTenants } from "@/lib/platform/tenants";
import { PlatformMetricsChart } from "./platform-metrics-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overview = await getPlatformOverview();
  const { tenants } = await listTenants({ pageSize: 50 });

  const totalTenants = overview.tenantStats?.total ?? 0;
  const activeTenants = overview.tenantStats?.active ?? 0;
  const totalTokens = overview.metricStats?.totalTokens ?? 0;
  const totalCost = Number(overview.metricStats?.totalCost ?? 0);
  const inactiveTenants = tenants.filter((tenant) => !tenant.isActive);

  return (
    <>
      <StatGrid
        items={[
          {
            label: "Tenants · Live",
            value: String(activeTenants),
            delta: totalTenants > activeTenants ? `${totalTenants - activeTenants} inactive` : undefined,
          },
          { label: "Tenants · Total", value: String(totalTenants) },
          {
            label: "Compute cost INR (30d)",
            value: `₹${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            delta: "platform burn",
          },
          {
            label: "AI tokens (30d)",
            value: totalTokens >= 1000 ? `${Math.round(totalTokens / 1000)} K` : String(totalTokens),
          },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-md border bg-surface p-4">
          <div className="text-[13px] font-semibold">
            At-risk tenants ({inactiveTenants.length})
          </div>
          <div className="mt-3 space-y-2 text-[12px]">
            {inactiveTenants.length === 0 ? (
              <div className="rounded-sm border p-3 text-muted-foreground">
                No inactive tenants — all schools are live on the platform.
              </div>
            ) : (
              inactiveTenants.slice(0, 5).map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex flex-wrap items-center justify-between gap-2 border rounded-sm p-2"
                >
                  <div className="font-medium">
                    {tenant.slug.toUpperCase()} · {tenant.name}
                  </div>
                  <div className="text-muted-foreground">Inactive · {tenant.subscriptionTier}</div>
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] bg-warning/10 text-warning border-warning/20"
                  >
                    Review
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md border bg-surface p-4 space-y-3">
          <div className="text-[13px] font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Platform copilot
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {activeTenants} live tenant{activeTenants === 1 ? "" : "s"} on the platform. AI throughput
            and compute burn for the last 30 days are tracked below — use the tenants registry to
            provision schools or review inactive accounts.
          </p>
          <Link href="/admin/tenants">
            <Button size="sm" variant="secondary" className="h-7 text-[11px]">
              Open school tenants
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border bg-surface p-4">
        <div className="text-[13px] font-semibold">AI token throughput (14 days)</div>
        <div className="mt-4">
          <PlatformMetricsChart data={overview.recentMetrics ?? []} />
        </div>
      </div>
    </>
  );
}

function StatGrid({
  items,
}: {
  items: { label: string; value: string; delta?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-md overflow-hidden border">
      {items.map((s) => (
        <div key={s.label} className="bg-surface p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          <div className="text-[18px] font-semibold mt-0.5 font-mono tabular-nums">{s.value}</div>
          {s.delta ? (
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.delta}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
