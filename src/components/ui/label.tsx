import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(props, ref) {
  const {
    required = false,
    optional = false,
    error,
    className = "",
    children,
    htmlFor,
    ...rest
  } = props;

  return (
    <label
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1 text-sm font-semibold select-none cursor-pointer text-slate-700",
        error && "text-red-600",
        className
      )}
      htmlFor={htmlFor}
      {...rest}
    >
      <span>{children}</span>
      {required && (
        <span className="text-red-500 font-bold text-xs" aria-hidden="true">
          *
        </span>
      )}
      {optional && (
        <span className="text-xs text-slate-400 font-normal">
          (optional)
        </span>
      )}
      {error && (
        <span className="ml-auto text-xs font-normal text-red-500">
          {error}
        </span>
      )}
    </label>
  );
});

export const LabelStyles = () => null;
export default Label;
