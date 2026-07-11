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
    <>
      <TextareaStyles />
      <textarea ref={ref} className={combinedClasses} {...rest} />
    </>
  );
});

const TextareaStyles = () => (
  <style>{`
    .textarea {
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
      min-height: 6rem;
    }

    .textarea::placeholder {
      color: var(--text-muted);
    }

    .textarea:hover {
      border-color: var(--border-strong);
    }

    .textarea:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-subtle);
      background: var(--bg-surface);
    }

    .textarea--error {
      border-color: var(--color-error-500);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .textarea--success {
      border-color: var(--color-success-500);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    .textarea--sm {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
      min-height: 4rem;
    }

    .textarea--md {
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      min-height: 6rem;
    }

    .textarea--lg {
      padding: var(--space-4) var(--space-5);
      font-size: var(--text-base);
      min-height: 8rem;
    }

    .textarea--resize-both {
      resize: both;
    }

    .textarea--resize-vertical {
      resize: vertical;
    }

    .textarea--resize-horizontal {
      resize: horizontal;
    }

    .textarea--resize-none {
      resize: none;
    }

    .textarea--flush {
      border-radius: 0;
      border-left: none;
      border-right: none;
    }
  `}</style>
);

export { TextareaStyles };
export default Textarea;