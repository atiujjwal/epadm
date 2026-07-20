"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Button as ShadcnButton,
  buttonVariants,
  type ButtonProps as ShadcnButtonProps,
} from "./button-base";
import { cn } from "@/lib/utils";

type LegacyVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | NonNullable<ShadcnButtonProps["variant"]>;
type LegacySize = "sm" | "md" | "lg" | "xl" | NonNullable<ShadcnButtonProps["size"]>;

function mapVariant(variant?: LegacyVariant): NonNullable<ShadcnButtonProps["variant"]> {
  if (variant === "primary") return "default";
  if (variant === "danger") return "destructive";
  if (
    variant === "secondary" ||
    variant === "ghost" ||
    variant === "outline" ||
    variant === "link" ||
    variant === "destructive" ||
    variant === "default"
  ) {
    return variant;
  }
  return "default";
}

function mapSize(size?: LegacySize): NonNullable<ShadcnButtonProps["size"]> {
  if (size === "md") return "default";
  if (size === "xl") return "lg";
  if (size === "sm" || size === "lg" || size === "icon" || size === "default") return size;
  return "default";
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: LegacyVariant;
  size?: LegacySize;
  icon?: ReactNode;
  iconOnly?: boolean;
  type?: "button" | "submit" | "reset";
}

export interface ButtonAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LegacyVariant;
  size?: LegacySize;
  icon?: ReactNode;
  iconOnly?: boolean;
  href: string;
}

type ButtonElementProps = ButtonProps | ButtonAnchorProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonElementProps>(
  function Button(props, ref) {
    const {
      variant = "primary",
      size = "md",
      icon,
      iconOnly = false,
      className,
      children,
    } = props;

    const mappedVariant = mapVariant(variant);
    const mappedSize = mapSize(size);
    const content = (
      <>
        {icon ? <span className="shrink-0">{icon}</span> : null}
        {!iconOnly && children}
      </>
    );

    if ("href" in props && props.href) {
      const {
        href,
        variant: _av,
        size: _as,
        icon: _ai,
        iconOnly: _aio,
        className: _ac,
        children: _ach,
        ...anchorRest
      } = props as ButtonAnchorProps;
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cn(buttonVariants({ variant: mappedVariant, size: mappedSize }), className)}
          {...anchorRest}
        >
          {content}
        </Link>
      );
    }

    const {
      variant: _v,
      size: _s,
      icon: _i,
      iconOnly: _io,
      className: _c,
      children: _ch,
      type,
      ...nativeButtonProps
    } = props as ButtonProps;

    return (
      <ShadcnButton
        ref={ref as React.Ref<HTMLButtonElement>}
        variant={mappedVariant}
        size={mappedSize}
        className={className}
        type={type ?? "button"}
        {...nativeButtonProps}
      >
        {content}
      </ShadcnButton>
    );
  },
);

export { buttonVariants };
export const ButtonStyles = () => null;
export default Button;
