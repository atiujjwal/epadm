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
      <SelectStyles />
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

const SelectStyles = () => (
  <style>{`
    .select__wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 100%;
    }

    .select__wrapper--has-left .select {
      padding-left: calc(var(--space-8) + var(--space-2));
    }

    .select {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      padding: var(--space-3) var(--space-4);
      padding-right: calc(var(--space-8) + var(--space-3));
      transition:
        border-color var(--duration-fast) var(--ease-default),
        box-shadow var(--duration-fast) var(--ease-default),
        background var(--duration-fast) var(--ease-default);
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .select:hover {
      border-color: var(--border-strong);
    }

    .select:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-subtle);
      background: var(--bg-surface);
    }

    .select--error {
      border-color: var(--color-error-500);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .select--success {
      border-color: var(--color-success-500);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    .select--sm {
      padding: var(--space-2) var(--space-3);
      padding-right: calc(var(--space-8) + var(--space-2));
      font-size: var(--text-xs);
    }

    .select--md {
      padding: var(--space-3) var(--space-4);
      padding-right: calc(var(--space-8) + var(--space-3));
      font-size: var(--text-sm);
    }

    .select--lg {
      padding: var(--space-4) var(--space-5);
      padding-right: calc(var(--space-8) + var(--space-4));
      font-size: var(--text-base);
    }

    .select--flush {
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    .select__element {
      position: absolute;
      top: 50%;
      left: var(--space-3);
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      pointer-events: none;
      flex-shrink: 0;
    }

    .select__chevron {
      position: absolute;
      top: 50%;
      right: var(--space-3);
      transform: translateY(-50%);
      width: 1.25rem;
      height: 1.25rem;
      color: var(--text-muted);
      pointer-events: none;
      flex-shrink: 0;
    }
  `}</style>
);

export { SelectStyles };
export default Select;