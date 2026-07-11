"use client";

import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  iconOnly?: boolean;
  asChild?: false;
  type?: "button" | "submit" | "reset";
}

export interface ButtonAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  iconOnly?: boolean;
  asChild?: false;
  href: string;
}

type ButtonElementProps = ButtonProps | ButtonAnchorProps;

/**
 * EPADM Button Component
 *
 * Unified button primitive with consistent styling across the application.
 * Supports both button and anchor (link) variants via props.
 *
 * @example
 * <Button variant="primary">Click me</Button>
 * <Button variant="secondary" size="lg" href="/docs">Learn more</Button>
 * <Button variant="ghost" size="sm" icon={<Icon />}>Quick</Button>
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonElementProps>(
  function Button(props, ref) {
    const {
      variant = "primary",
      size = "md",
      icon,
      iconOnly = false,
      className = "",
      children,
      ...rest
    } = props;

    const isAnchor = "href" in props && props.href !== undefined;

    const baseClasses = "btn";
    const variantClasses = {
      primary: "btn--primary",
      secondary: "btn--secondary",
      ghost: "btn--ghost",
      danger: "btn--danger",
    }[variant];

    const sizeClasses = {
      sm: "btn--sm",
      md: "btn--md",
      lg: "btn--lg",
      xl: "btn--xl",
    }[size];

    const iconOnlyClass = iconOnly ? "btn--icon-only" : "";

    const combinedClasses = [baseClasses, variantClasses, sizeClasses, iconOnlyClass, className]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        <ButtonStyles />
        {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
        {!iconOnly && children && <span className="btn__content">{children}</span>}
      </>
    );

    if (isAnchor) {
      const { href, ...anchorRest } = props as ButtonAnchorProps;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={combinedClasses}
          href={href}
          {...(anchorRest as any)}
        >
          {content}
        </a>
      );
    }

    const buttonProps = props as ButtonProps;
    const { type: buttonType, ...buttonRest } = buttonProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClasses}
        disabled={buttonProps.disabled}
        type={buttonType || "button"}
        {...(buttonRest as any)}
      >
        {content}
      </button>
    );
  }
);

// Add danger button styles to global CSS via style tag
const ButtonStyles = () => (
  <style>{`
    .btn--danger {
      background: var(--color-error-500);
      color: var(--color-white);
      border-color: var(--color-error-500);
    }
    .btn--danger:hover {
      background: var(--color-error-600);
      border-color: var(--color-error-600);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
      color: var(--color-white);
    }

    .btn--md {
      padding: var(--space-3) var(--space-5);
      font-size: var(--text-sm);
    }

    .btn--icon-only {
      padding: var(--space-2-5);
      aspect-ratio: 1;
    }

    .btn__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .btn__icon > svg {
      width: 1em;
      height: 1em;
    }

    .btn__content {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
  `}</style>
);

export { ButtonStyles };
export default Button;