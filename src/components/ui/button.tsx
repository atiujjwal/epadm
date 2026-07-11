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
          {...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)}
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
        {...(buttonRest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

// Styles are now consolidated into global CSS
const ButtonStyles = () => null;

export { ButtonStyles };
export default Button;