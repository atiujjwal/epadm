"use client";

import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

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
 * Modern EPADM Button Component
 *
 * Fully backward-compatible drop-in replacement featuring an upgraded aesthetic.
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

    // Modern, accessible base design primitives
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";

    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm focus-visible:ring-blue-500",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 focus-visible:ring-slate-500",
      ghost: "text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus-visible:ring-red-500",
    }[variant];

    const sizeClasses = {
      sm: iconOnly ? "p-1.5 text-xs" : "px-3 py-1.5 text-xs gap-1.5",
      md: iconOnly ? "p-2 text-sm" : "px-4 py-2 text-sm gap-2",
      lg: iconOnly ? "p-3 text-base" : "px-5 py-2.5 text-base gap-2.5",
      xl: iconOnly ? "p-4 text-lg" : "px-6 py-3.5 text-lg gap-3",
    }[size];

    // Merge styles dynamically while maintaining full support for legacy custom class overrides
    const combinedClasses = cn(baseClasses, variantClasses, sizeClasses, className);

    const content = (
      <>
        {icon && (
          <span className="flex items-center justify-center shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        {!iconOnly && children && <span>{children}</span>}
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

// Retained strictly for backward compatibility so imports don't break elsewhere
export const ButtonStyles = () => null;

export default Button;