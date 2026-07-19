import { Badge } from "./badge";

export interface ActivityRowProps {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  joinedAt: Date | string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ActivityRow({ name, email, role, isActive, joinedAt }: ActivityRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50/50 rounded-xl transition-colors duration-150 border border-slate-100/50 bg-white">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700" aria-hidden="true">
        {getInitials(name)}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
        <span className="text-xs text-slate-500 truncate">{email}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Badge variant={isActive ? "success" : "default"} size="sm">
          {isActive ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="outline" size="sm">
          {role}
        </Badge>
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap min-w-[50px] text-right">
          {relativeTime(joinedAt)}
        </span>
      </div>
    </div>
  );
}

export default ActivityRow;
