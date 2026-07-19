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

  const baseClasses = "rounded-2xl bg-white border transition-all duration-200 ease-in-out";

  const variantClasses = {
    default: "border-slate-200",
    elevated: "border-slate-200 shadow-sm",
    outlined: "border-slate-300 bg-transparent",
    interactive: "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md cursor-pointer",
  }[variant];

  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }[padding];

  return (
    <div ref={ref} className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`} {...rest}>
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
    <div ref={ref} className={`flex items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-4 ${className}`} {...rest}>
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
    <div ref={ref} className={`flex flex-col gap-4 ${className}`} {...rest}>
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
    <div ref={ref} className={`flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-4 ${className}`} {...rest}>
      {children}
    </div>
  );
});

// Styles are now consolidated into global CSS
const CardStyles = () => null;

export { CardStyles };
export default Card;