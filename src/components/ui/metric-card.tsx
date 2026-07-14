import { ReactNode } from "react";
import { Card } from "./card";

export interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  colorScheme?: "blue" | "emerald" | "violet" | "amber" | "rose" | "indigo";
  mono?: boolean;
  capitalize?: boolean;
  valueClassName?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  colorScheme = "blue",
  mono,
  capitalize,
  valueClassName,
}: MetricCardProps) {
  const valueClasses = [
    "stat-card__value",
    mono && "stat-card__value--mono",
    capitalize && "stat-card__value--capitalize",
    valueClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card variant="elevated" padding="md" className="stat-card">
      <div
        className={`stat-card__icon stat-card__icon--${colorScheme}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="stat-card__label">{label}</div>
      <div className={valueClasses}>{value}</div>
      {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
      {trend && (
        <div
          className={`stat-card__trend ${trend.positive ? "stat-card__trend--up" : "stat-card__trend--down"}`}
        >
          {trend.value}
        </div>
      )}
    </Card>
  );
}

export default MetricCard;
