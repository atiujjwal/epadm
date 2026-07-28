interface FormErrorSummaryProps {
  errors: string[];
  id?: string;
}

export function FormErrorSummary({
  errors,
  id = "form-errors",
}: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3"
      tabIndex={-1}
    >
      <p className="text-sm font-medium text-danger-foreground">
        Please fix the following before continuing:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-danger-foreground/80">
        {errors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
      </ul>
    </div>
  );
}
