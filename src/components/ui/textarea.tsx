import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "flush";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
  resize?: "both" | "vertical" | "horizontal" | "none";
}

/**
 * EPADM Textarea Component
 *
 * Unified multi-line text input with consistent styling and validation states.
 *
 * @example
 * <Textarea placeholder="Enter message" />
 * <Textarea error resize="vertical" rows={4} />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const {
    variant = "default",
    size = "md",
    error = false,
    success = false,
    resize = "vertical",
    className = "",
    ...rest
  } = props;

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  }[size];

  const resizeClasses = {
    both: "resize",
    vertical: "resize-y",
    horizontal: "resize-x",
    none: "resize-none",
  }[resize];

  const stateClasses = error
    ? "border-red-500 ring-1 ring-red-100 focus:border-red-500 focus:ring-red-100"
    : success
    ? "border-emerald-500 ring-1 ring-emerald-100 focus:border-emerald-500 focus:ring-emerald-100"
    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100";

  const variantClasses = variant === "flush" ? "bg-transparent border-transparent" : "bg-white border";

  return (
    <textarea
      ref={ref}
      className={`block w-full rounded-xl text-slate-900 outline-none transition duration-200 ${sizeClasses} ${variantClasses} ${stateClasses} ${resizeClasses} ${className}`}
      {...rest}
    />
  );
});

// Styles are now consolidated into global CSS
const TextareaStyles = () => null;

export { TextareaStyles };
export default Textarea;