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

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  }[size];

  const stateClasses = error
    ? "border-red-500 ring-1 ring-red-100"
    : success
    ? "border-emerald-500 ring-1 ring-emerald-100"
    : "border-slate-200 ring-1 ring-transparent focus:border-indigo-500 focus:ring-indigo-100";

  const variantClasses = variant === "flush" ? "bg-transparent border-transparent" : "bg-white border";

  return (
    <div className="relative w-full">
      {leftElement && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-500">
          {leftElement}
        </span>
      )}
      <select
        ref={ref}
        className={`block w-full rounded-xl pr-10 text-slate-900 outline-none transition duration-200 ${sizeClasses} ${variantClasses} ${stateClasses} ${className} ${leftElement ? 'pl-10' : 'pl-4'}`}
        {...rest}
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute inset-y-0 right-3 h-full w-5 text-slate-400" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

// Styles are now consolidated into global CSS
const SelectStyles = () => null;

export { SelectStyles };
export default Select;