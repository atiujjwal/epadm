import { cn } from "@/lib/cn";

export interface RoleChartProps {
  data: { role: string; count: number }[];
  total: number;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-violet-500",
  teacher: "bg-blue-500",
  student: "bg-emerald-500",
  parent: "bg-amber-500",
  staff: "bg-indigo-500",
  accountant: "bg-rose-500",
  librarian: "bg-teal-500",
};

export function RoleChart({ data, total }: RoleChartProps) {
  if (!data.length || total === 0) {
    return (
      <div className="flex items-center justify-center py-8 border border-dashed border-slate-200 rounded-lg">
        <p className="text-sm text-slate-500">No members assigned yet</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3.5" role="img" aria-label="Role distribution chart">
      {sorted.map(({ role, count }) => {
        const pct = Math.round((count / total) * 100);
        const colorClass = ROLE_COLORS[role] ?? "bg-slate-400";

        return (
          <div key={role} className="flex items-center gap-3 text-sm">
            <span className="w-20 capitalize text-slate-600 truncate font-medium">{role}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", colorClass)}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="w-8 text-right font-semibold text-slate-800">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default RoleChart;
