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
    <>
      <BadgeStyles />
      <span ref={ref} className={combinedClasses} {...rest}>
        {dot && <span className="badge__dot" aria-hidden="true" />}
        <span className="badge__content">{children}</span>
      </span>
    </>
  );
});

const BadgeStyles = () => (
  <style>{`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1-5);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: var(--tracking-wide);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      line-height: 1;
    }

    .badge--default {
      background: var(--bg-surface-2);
      color: var(--text-secondary);
      border: 1px solid var(--border-default);
    }

    .badge--accent {
      background: var(--accent-subtle);
      color: var(--accent-hover);
      border: 1px solid var(--border-accent);
    }

    .badge--success {
      background: var(--color-success-50);
      color: var(--color-success-600);
      border: 1px solid var(--color-success-100);
    }

    .badge--warning {
      background: var(--color-warning-50);
      color: var(--color-warning-600);
      border: 1px solid var(--color-warning-100);
    }

    .badge--error {
      background: var(--color-error-50);
      color: var(--color-error-600);
      border: 1px solid var(--color-error-100);
    }

    .badge--outline {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-strong);
    }

    .badge--sm {
      font-size: 0.625rem;
      padding: var(--space-0-5) var(--space-2);
    }

    .badge--md {
      font-size: var(--text-xs);
      padding: var(--space-1) var(--space-3);
    }

    .badge__dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }

    .badge--success .badge__dot {
      background: var(--color-success-500);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
    }

    .badge--warning .badge__dot {
      background: var(--color-warning-500);
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
    }

    .badge--error .badge__dot {
      background: var(--color-error-500);
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
    }

    .badge__content {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
  `}</style>
);

export { BadgeStyles };
export default Badge;