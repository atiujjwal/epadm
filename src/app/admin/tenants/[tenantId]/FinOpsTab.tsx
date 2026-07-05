"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
        <h3 className="text-lg font-semibold text-zinc-950">FinOps</h3>
        <div className="text-sm text-zinc-600">
          Period total:{" "}
          <span className="font-semibold text-zinc-950">
            INR {totalCost.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="h-64 rounded-2xl border border-zinc-200 bg-white p-4">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No cost data yet. AI metering events will populate this view.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#b45309"
                fill="#fde68a"
                name="Cost (INR)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
