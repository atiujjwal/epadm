import { LabelHTMLAttributes, forwardRef } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

/**
 * EPADM Label Component
 *
 * Form label with consistent styling, required/optional indicators, and error states.
 *
 * @example
 * <Label htmlFor="email">Email</Label>
 * <Label htmlFor="name" required>Full Name</Label>
 * <Label htmlFor="phone" optional>Phone</Label>
 * <Label htmlFor="email" error="Invalid email">Email</Label>
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(props, ref) {
  const {
    required = false,
    optional = false,
    error,
    className = "",
    children,
    htmlFor,
    ...rest
  } = props;

  const combinedClasses = ["label", className, error && "label--error"]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <LabelStyles />
      <label ref={ref} className={combinedClasses} htmlFor={htmlFor} {...rest}>
        <span className="label__text">{children}</span>
        {required && <span className="label__indicator label__indicator--required" aria-hidden="true">*</span>}
        {optional && <span className="label__indicator label__indicator--optional">(optional)</span>}
        {error && <span className="label__error">{error}</span>}
      </label>
    </>
  );
});

const LabelStyles = () => (
  <style>{`
    .label {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      margin-bottom: var(--space-1-5);
    }

    .label--error {
      color: var(--color-error-600);
    }

    .label__text {
      line-height: 1;
    }

    .label__indicator {
      font-size: var(--text-xs);
    }

    .label__indicator--required {
      color: var(--color-error-500);
      font-weight: var(--weight-semibold);
    }

    .label__indicator--optional {
      color: var(--text-muted);
      font-weight: var(--weight-regular);
      text-transform: lowercase;
    }

    .label__error {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      width: 100%;
      margin-top: var(--space-1);
      font-size: var(--text-xs);
      font-weight: var(--weight-regular);
      color: var(--color-error-600);
    }
  `}</style>
);

export { LabelStyles };
export default Label;