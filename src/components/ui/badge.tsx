import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "accent"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "error"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
  children: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "default",
    size = "md",
    dot = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const variantClasses = {
    default: "border-border bg-muted text-muted-foreground",
    accent: "border-info/20 bg-info/10 text-info",
    success: "border-success/20 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning-foreground",
    danger: "border-danger/20 bg-danger/10 text-danger",
    info: "border-info/20 bg-info/10 text-info",
    error: "border-danger/20 bg-danger/10 text-danger",
    outline: "border-border bg-transparent text-muted-foreground",
  }[variant];

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.08em] transition-colors duration-base",
        variantClasses,
        size === "sm" ? "px-2 py-1 text-[0.625rem]" : "px-3 py-1 text-xs",
        className,
      )}
      {...props}
    >
      {dot ? (
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </span>
  );
});

export const BadgeStyles = () => null;
export default Badge;
