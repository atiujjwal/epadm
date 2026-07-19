import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

/**
 * EPADM Badge Component
 *
 * Inline status badges and labels with consistent styling.
 * Supports variant colors for different states (success, warning, error).
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="accent" dot>New</Badge>
 * <Badge variant="outline">Draft</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const {
    variant = "default",
    size = "md",
    dot = false,
    className = "",
    children,
    ...rest
  } = props;

  const baseClasses = "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200";

  const variantClasses = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-100",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    error: "bg-rose-100 text-rose-700 border-rose-200",
    outline: "bg-transparent text-slate-700 border-slate-300",
  }[variant];

  const sizeClasses = {
    sm: "px-2 py-1 text-[0.625rem]",
    md: "px-3 py-1 text-xs",
  }[size];

  return (
    <span
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...rest}
    >
      {dot && <span className="inline-flex h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
});

// Styles are now consolidated into global CSS
const BadgeStyles = () => null;

export { BadgeStyles };
export default Badge;