"use client";

import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md font-medium text-sm",
    "transition-colors duration-fast",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        danger:
          "bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonExtras extends ButtonVariantProps {
  asChild?: boolean;
  loading?: boolean;
  /** @deprecated Place the icon in children for new call sites. */
  icon?: React.ReactNode;
  /** @deprecated Use size="icon" and an accessible label for new call sites. */
  iconOnly?: boolean;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonExtras {}

export interface ButtonAnchorProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    Omit<ButtonExtras, "asChild"> {
  href: string;
}

type ButtonElementProps = ButtonProps | ButtonAnchorProps;

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonElementProps
>(function Button(
  {
    className,
    variant,
    size,
    loading = false,
    icon,
    iconOnly = false,
    children,
    ...props
  },
  ref,
) {
  const content = (
    <>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading…</span>
        </>
      ) : (
        icon
      )}
      {!iconOnly ? children : null}
    </>
  );

  if ("href" in props) {
    const { href, ...anchorProps } = props;
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-disabled={loading || undefined}
        {...anchorProps}
      >
        {content}
      </Link>
    );
  }

  const { asChild = false, disabled, ...buttonProps } = props;
  const Component = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  return (
    <Component
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={isDisabled || undefined}
      {...buttonProps}
    >
      {content}
    </Component>
  );
});
Button.displayName = "Button";

export const ButtonStyles = () => null;
export { Button, buttonVariants };
export default Button;
