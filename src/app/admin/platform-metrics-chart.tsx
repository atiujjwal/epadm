"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricPoint = {
  logDate: string;
  totalTokens: number;
  totalCost: string;
};

export function PlatformMetricsChart({ data }: { data: MetricPoint[] }) {
  const chartData = data.map((row) => ({
    date: row.logDate,
    tokens: row.totalTokens,
    cost: Number(row.totalCost),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-500">
        No metering data yet. AI usage will appear here once tracked.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="tokens"
            stroke="#d97706"
            fill="url(#tokenFill)"
            name="AI tokens"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
