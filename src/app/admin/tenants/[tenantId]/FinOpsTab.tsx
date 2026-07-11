"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

type MetricRow = {
  logDate: string;
  computeCostInr: string;
  totalAiTokens: number;
  dbStorageBytes: number;
};

export function FinOpsTab({ metrics }: { metrics: MetricRow[] }) {
  const chartData = metrics.map((row) => ({
    date: row.logDate,
    cost: Number(row.computeCostInr),
    storageGb: row.dbStorageBytes / (1024 * 1024 * 1024),
    tokens: row.totalAiTokens,
  }));

  const totalCost = chartData.reduce((sum, row) => sum + row.cost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">FinOps</h3>
        <div className="text-sm text-secondary">
          Period total:{" "}
          <span className="font-semibold text-primary">
            INR {totalCost.toFixed(4)}
          </span>
        </div>
      </div>

      <Card variant="default" padding="md" className="h-64">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No cost data yet. AI metering events will populate this view.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="var(--chart-amber)"
                fill="var(--chart-amber-fill)"
                name="Cost (INR)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
