import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

/**
 * EPADM Card Component
 *
 * Container component for grouping related content with consistent styling.
 * Supports variants for different contexts (elevated cards, interactive cards, etc.).
 *
 * @example
 * <Card variant="elevated">
 *   <CardHeader>Title</CardHeader>
 *   <CardBody>Content here</CardBody>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const {
    variant = "default",
    padding = "md",
    className = "",
    children,
    ...rest
  } = props;

  const baseClasses = "card";
  const variantClasses = {
    default: "card--default",
    elevated: "card--elevated",
    outlined: "card--outlined",
    interactive: "card--interactive",
  }[variant];

  const paddingClasses = {
    none: "card--padding-none",
    sm: "card--padding-sm",
    md: "card--padding-md",
    lg: "card--padding-lg",
  }[padding];

  const combinedClasses = [baseClasses, variantClasses, paddingClasses, className]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <CardStyles />
      <div ref={ref} className={combinedClasses} {...rest}>
        {children}
      </div>
    </>
  );
});

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <div ref={ref} className={`card__header ${className}`} {...rest}>
      {children}
    </div>
  );
});

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <div ref={ref} className={`card__body ${className}`} {...rest}>
      {children}
    </div>
  );
});

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <div ref={ref} className={`card__footer ${className}`} {...rest}>
      {children}
    </div>
  );
});

const CardStyles = () => (
  <style>{`
    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      transition:
        border-color var(--duration-normal) var(--ease-default),
        box-shadow var(--duration-normal) var(--ease-default),
        background var(--duration-normal) var(--ease-default);
    }

    .card--default {
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
    }

    .card--elevated {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-md);
    }

    .card--outlined {
      background: transparent;
      border: 1px solid var(--border-strong);
    }

    .card--interactive {
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      cursor: pointer;
    }

    .card--interactive:hover {
      border-color: var(--border-accent);
      box-shadow: 0 4px 12px var(--accent-glow);
      transform: translateY(-2px);
    }

    .card--padding-none {
      padding: 0;
    }

    .card--padding-sm {
      padding: var(--space-4);
    }

    .card--padding-md {
      padding: var(--space-6);
    }

    .card--padding-lg {
      padding: var(--space-8);
    }

    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: var(--space-4);
    }

    .card__header:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .card__body {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-subtle);
      margin-top: var(--space-4);
    }
  `}</style>
);

export { CardStyles };
export default Card;