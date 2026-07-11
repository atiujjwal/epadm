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
    <label ref={ref} className={combinedClasses} htmlFor={htmlFor} {...rest}>
      <span className="label__text">{children}</span>
      {required && <span className="label__indicator label__indicator--required" aria-hidden="true">*</span>}
      {optional && <span className="label__indicator label__indicator--optional">(optional)</span>}
      {error && <span className="label__error">{error}</span>}
    </label>
  );
});

// Styles are now consolidated into global CSS
const LabelStyles = () => null;

export { LabelStyles };
export default Label;