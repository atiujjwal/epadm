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

  const baseClasses = "badge";
  const variantClasses = {
    default: "badge--default",
    accent: "badge--accent",
    success: "badge--success",
    warning: "badge--warning",
    error: "badge--error",
    outline: "badge--outline",
  }[variant];

  const sizeClasses = {
    sm: "badge--sm",
    md: "badge--md",
  }[size];

  const combinedClasses = [baseClasses, variantClasses, sizeClasses, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={ref} className={combinedClasses} {...rest}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      <span className="badge__content">{children}</span>
    </span>
  );
});

// Styles are now consolidated into global CSS
const BadgeStyles = () => null;

export { BadgeStyles };
export default Badge;