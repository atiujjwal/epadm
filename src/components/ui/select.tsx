import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: "default" | "flush";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
  leftElement?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * EPADM Select Component
 *
 * Unified dropdown select with consistent styling and validation states.
 *
 * @example
 * <Select>
 *   <option value="">Select option</option>
 *   <option value="1">Option 1</option>
 * </Select>
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const {
    variant = "default",
    size = "md",
    error = false,
    success = false,
    leftElement,
    className = "",
    children,
    ...rest
  } = props;

  const baseClasses = "select";
  const variantClasses = {
    default: "select--default",
    flush: "select--flush",
  }[variant];

  const sizeClasses = {
    sm: "select--sm",
    md: "select--md",
    lg: "select--lg",
  }[size];

  const stateClasses = error
    ? "select--error"
    : success
    ? "select--success"
    : "";

  const hasLeftElement = !!leftElement;

  const wrapperClasses = [
    "select__wrapper",
    hasLeftElement && "select__wrapper--has-left",
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
        <span className="select__element" aria-hidden="true">
          {leftElement}
        </span>
      )}
      <select ref={ref} className={combinedClasses} {...rest}>
        {children}
      </select>
      <svg
        className="select__chevron"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5.5 7.5L10 12L14.5 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

// Styles are now consolidated into global CSS
const SelectStyles = () => null;

export { SelectStyles };
export default Select;