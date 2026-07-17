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

const colorStyles = {
  blue: "bg-blue-100/80 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  emerald: "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  violet: "bg-violet-100/80 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  amber: "bg-amber-100/80 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  rose: "bg-rose-100/80 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  indigo: "bg-indigo-100/80 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
};

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
  return (
    <Card 
      variant="elevated" 
      className="flex flex-col justify-between p-5 transition-shadow duration-200 hover:shadow-md h-full w-full"
    >
      <div className="flex items-start justify-between pb-2">
        <p className="text-sm font-medium tracking-tight text-muted-foreground">
          {label}
        </p>
        <div className={`rounded-xl p-2.5 ${colorStyles[colorScheme]}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-2">
        <h3 
          className={`text-3xl font-bold tracking-tight text-foreground ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""} ${valueClassName || ""}`}
        >
          {value}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-xs text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className={`mt-2 flex items-center text-sm font-medium ${trend.positive ? "text-emerald-600" : "text-rose-600"}`}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>
    </Card>
  );
}

export default MetricCard;