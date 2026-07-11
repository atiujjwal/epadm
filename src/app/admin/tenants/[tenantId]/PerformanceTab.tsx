"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

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
      <h3 className="text-lg font-semibold text-primary">Performance</h3>
      <Card variant="default" padding="md" className="h-64">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No performance metrics recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="var(--chart-green)"
                name="Active users"
              />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="var(--chart-amber)"
                name="AI tokens"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
