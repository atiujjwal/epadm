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

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  }[size];

  const stateClasses = error
    ? "border-red-500 ring-1 ring-red-100 focus:border-red-500 focus:ring-red-100"
    : success
    ? "border-emerald-500 ring-1 ring-emerald-100 focus:border-emerald-500 focus:ring-emerald-100"
    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100";

  const variantClasses = variant === "flush"
    ? "bg-transparent border-transparent"
    : "bg-white border";

  return (
    <div className={`relative w-full ${leftElement ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''}`}>
      {leftElement && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-500">
          {leftElement}
        </span>
      )}
      <input
        ref={ref}
        className={`block w-full rounded-xl text-slate-900 outline-none transition duration-200 ${sizeClasses} ${variantClasses} ${stateClasses} ${className}`}
        {...rest}
      />
      {rightElement && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
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
