import { HTMLAttributes, forwardRef, ReactNode } from "react";

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

export interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  error?: string;
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(props, ref) {
  const { children, error, className = "", ...rest } = props;

  return (
    <div
      ref={ref}
      className={cx(
        "grid gap-3",
        error ? "text-red-700" : "text-slate-900",
        className,
      )}
      {...rest}
    >
      {children}
      {error && <FormError>{error}</FormError>}
    </div>
  );
});

export interface FormProps extends HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  layout?: "vertical" | "horizontal";
  labelWidth?: string;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(props, ref) {
  const {
    children,
    layout = "vertical",
    labelWidth,
    className = "",
    ...rest
  } = props;

  const classNameValue = cx(
    "grid gap-6",
    layout === "horizontal" && "items-start md:grid-cols-[minmax(var(--form-label-width),auto)_1fr]",
    className,
  );

  const style = labelWidth && layout === "horizontal"
    ? { "--form-label-width": labelWidth, ...rest.style }
    : rest.style;

  return (
    <form ref={ref} className={classNameValue} style={style} {...rest}>
      {children}
    </form>
  );
});

export interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const FormError = forwardRef<HTMLParagraphElement, FormErrorProps>(function FormError(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <p
      ref={ref}
      className={cx(
        "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        className,
      )}
      role="alert"
      {...rest}
    >
      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700" aria-hidden="true">
        !
      </span>
      {children}
    </p>
  );
});

export interface FormSuccessProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const FormSuccess = forwardRef<HTMLParagraphElement, FormSuccessProps>(function FormSuccess(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <p
      ref={ref}
      className={cx(
        "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700",
        className,
      )}
      role="status"
      {...rest}
    >
      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">
        ✓
      </span>
      {children}
    </p>
  );
});

export interface FormDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(function FormDescription(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <p className={cx("text-sm text-slate-500", className)} ref={ref} {...rest}>
      {children}
    </p>
  );
});

export interface FormGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(function FormGroup(props, ref) {
  const { children, title, description, className = "", ...rest } = props;

  return (
    <div ref={ref} className={cx("grid gap-3", className)} {...rest}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
});

// Styles are now consolidated into global CSS
const FormStyles = () => null;

export { FormStyles };
export default Form;