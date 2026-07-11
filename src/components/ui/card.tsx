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
    <div ref={ref} className={combinedClasses} {...rest}>
      {children}
    </div>
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

// Styles are now consolidated into global CSS
const CardStyles = () => null;

export { CardStyles };
export default Card;