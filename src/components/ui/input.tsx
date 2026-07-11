import { InputHTMLAttributes, forwardRef } from "react";

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

  const baseClasses = "input";
  const variantClasses = {
    default: "input--default",
    flush: "input--flush",
  }[variant];

  const sizeClasses = {
    sm: "input--sm",
    md: "input--md",
    lg: "input--lg",
  }[size];

  const stateClasses = error
    ? "input--error"
    : success
    ? "input--success"
    : "";

  const hasLeftElement = !!leftElement;
  const hasRightElement = !!rightElement;

  const wrapperClasses = [
    "input__wrapper",
    hasLeftElement && "input__wrapper--has-left",
    hasRightElement && "input__wrapper--has-right",
  ]
    .filter(Boolean)
    .join(" ");

  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {leftElement && (
        <span className="input__element input__element--left" aria-hidden="true">
          {leftElement}
        </span>
      )}
      <input ref={ref} className={combinedClasses} {...rest} />
      {rightElement && (
        <span className="input__element input__element--right" aria-hidden="true">
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