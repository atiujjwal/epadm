import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "flush";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

/**
 * EPADM Input Component
 *
 * Unified text input with consistent styling, validation states, and optional elements.
 *
 * @example
 * <Input placeholder="Enter email" />
 * <Input error leftElement={<Icon />} />
 * <Input size="lg" success />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    variant = "default",
    size = "md",
    error = false,
    success = false,
    leftElement,
    rightElement,
    className = "",
    ...rest
  } = props;

  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs",
    md: "h-9 px-3 text-[13px]",
    lg: "h-10 px-3.5 text-sm",
  }[size];

  const stateClasses = error
    ? "border-destructive focus-visible:ring-destructive/25"
    : success
    ? "border-success focus-visible:ring-success/25"
    : "border-input focus-visible:ring-ring";

  const variantClasses = variant === "flush"
    ? "border-transparent bg-transparent shadow-none"
    : "border bg-background shadow-sm";

  return (
    <div className="relative w-full">
      {leftElement && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-muted-foreground">
          {leftElement}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "block w-full rounded-md text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2",
          sizeClasses,
          variantClasses,
          stateClasses,
          leftElement && "pl-9",
          rightElement && "pr-9",
          className,
        )}
        {...rest}
      />
      {rightElement && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
          {rightElement}
        </span>
      )}
    </div>
  );
});

// Styles are now consolidated into global CSS
const InputStyles = () => null;

export { InputStyles };
export default Input;
