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
    <div className="activity-row">
      <div className="activity-row__avatar" aria-hidden="true">
        {getInitials(name)}
      </div>
      <div className="activity-row__info">
        <span className="activity-row__name">{name}</span>
        <span className="activity-row__email">{email}</span>
      </div>
      <div className="activity-row__meta">
        <Badge variant={isActive ? "success" : "default"} size="sm">
          {isActive ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="outline" size="sm">
          {role}
        </Badge>
        <span className="activity-row__date">{relativeTime(joinedAt)}</span>
      </div>
    </div>
  );
}

export default ActivityRow;
