import { HTMLAttributes, forwardRef, ReactNode } from "react";

export interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  error?: string;
}

/**
 * EPADM FormItem Component
 *
 * Wrapper for form fields with consistent spacing and error handling.
 *
 * @example
 * <FormItem error={errors.email}>
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" type="email" />
 * </FormItem>
 */
export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(props, ref) {
  const { children, error, className = "", ...rest } = props;

  const combinedClasses = ["form-item", error && "form-item--error", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={combinedClasses} {...rest}>
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

/**
 * EPADM Form Component
 *
 * Form wrapper with layout options for vertical or horizontal forms.
 *
 * @example
 * <Form layout="vertical">
 *   <FormItem>...</FormItem>
 * </Form>
 *
 * <Form layout="horizontal" labelWidth="200px">
 *   <FormItem>...</FormItem>
 * </Form>
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(props, ref) {
  const {
    children,
    layout = "vertical",
    labelWidth,
    className = "",
    ...rest
  } = props;

  const combinedClasses = ["form", `form--${layout}`, className]
    .filter(Boolean)
    .join(" ");

  const style = labelWidth && layout === "horizontal"
    ? { "--form-label-width": labelWidth, ...rest.style }
    : rest.style;

  return (
    <form ref={ref} className={combinedClasses} style={style} {...rest}>
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
      className={`form-error ${className}`}
      role="alert"
      {...rest}
    >
      <svg className="form-error__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
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
      className={`form-success ${className}`}
      role="status"
      {...rest}
    >
      <svg className="form-success__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
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
    <p
      ref={ref}
      className={`form-description ${className}`}
      {...rest}
    >
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
    <div ref={ref} className={`form-group ${className}`} {...rest}>
      {(title || description) && (
        <div className="form-group__header">
          {title && <h3 className="form-group__title">{title}</h3>}
          {description && <p className="form-group__description">{description}</p>}
        </div>
      )}
      <div className="form-group__content">{children}</div>
    </div>
  );
});

// Styles are now consolidated into global CSS
const FormStyles = () => null;

export { FormStyles };
export default Form;