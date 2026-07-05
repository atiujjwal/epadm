"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricRow = {
  logDate: string;
  activeUsers: number;
  totalAiTokens: number;
  dbStorageBytes: number;
};

export function PerformanceTab({ metrics }: { metrics: MetricRow[] }) {
  const chartData = metrics.map((row) => ({
    date: row.logDate,
    activeUsers: row.activeUsers,
    tokens: row.totalAiTokens,
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-950">Performance</h3>
      <div className="h-64 rounded-2xl border border-zinc-200 bg-white p-4">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No performance metrics recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#059669"
                name="Active users"
              />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="#d97706"
                name="AI tokens"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
