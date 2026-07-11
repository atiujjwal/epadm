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

  const baseClasses = "textarea";
  const variantClasses = {
    default: "textarea--default",
    flush: "textarea--flush",
  }[variant];

  const sizeClasses = {
    sm: "textarea--sm",
    md: "textarea--md",
    lg: "textarea--lg",
  }[size];

  const resizeClasses = {
    both: "textarea--resize-both",
    vertical: "textarea--resize-vertical",
    horizontal: "textarea--resize-horizontal",
    none: "textarea--resize-none",
  }[resize];

  const stateClasses = error
    ? "textarea--error"
    : success
    ? "textarea--success"
    : "";

  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    resizeClasses,
    stateClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea ref={ref} className={combinedClasses} {...rest} />
  );
});

// Styles are now consolidated into global CSS
const TextareaStyles = () => null;

export { TextareaStyles };
export default Textarea;