export interface RoleChartProps {
  data: { role: string; count: number }[];
  total: number;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "var(--color-violet-500)",
  teacher: "var(--color-blue-500)",
  student: "var(--color-emerald-500)",
  parent: "var(--color-amber-500)",
  staff: "var(--color-indigo-500)",
  accountant: "var(--color-rose-500)",
  librarian: "var(--color-teal-500)",
};

export function RoleChart({ data, total }: RoleChartProps) {
  if (!data.length || total === 0) {
    return (
      <div className="role-chart role-chart--empty">
        <p className="role-chart__empty-text">No members assigned yet</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="role-chart" role="img" aria-label="Role distribution chart">
      {sorted.map(({ role, count }) => {
        const pct = Math.round((count / total) * 100);
        const color = ROLE_COLORS[role] ?? "var(--color-neutral-400)";

        return (
          <div key={role} className="role-chart__row">
            <span className="role-chart__label">{role}</span>
            <div className="role-chart__bar-track">
              <div
                className="role-chart__bar-fill"
                style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
              />
            </div>
            <span className="role-chart__count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default RoleChart;
