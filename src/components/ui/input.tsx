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
      <InputStyles />
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

const InputStyles = () => (
  <style>{`
    .input__wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 100%;
    }

    .input__wrapper--has-left .input {
      padding-left: calc(var(--space-8) + var(--space-2));
    }

    .input__wrapper--has-right .input {
      padding-right: calc(var(--space-8) + var(--space-2));
    }

    .input {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      padding: var(--space-3) var(--space-4);
      transition:
        border-color var(--duration-fast) var(--ease-default),
        box-shadow var(--duration-fast) var(--ease-default),
        background var(--duration-fast) var(--ease-default);
      outline: none;
      appearance: none;
      -webkit-appearance: none;
    }

    .input::placeholder {
      color: var(--text-muted);
    }

    .input:hover {
      border-color: var(--border-strong);
    }

    .input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-subtle);
      background: var(--bg-surface);
    }

    .input--error {
      border-color: var(--color-error-500);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .input--error:focus {
      border-color: var(--color-error-600);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .input--success {
      border-color: var(--color-success-500);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    .input--success:focus {
      border-color: var(--color-success-600);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    .input--sm {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
    }

    .input--md {
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
    }

    .input--lg {
      padding: var(--space-4) var(--space-5);
      font-size: var(--text-base);
    }

    .input--flush {
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    .input__element {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      pointer-events: none;
      flex-shrink: 0;
    }

    .input__element--left {
      left: var(--space-3);
    }

    .input__element--right {
      right: var(--space-3);
    }

    .input__element > svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  `}</style>
);

export { InputStyles };
export default Input;