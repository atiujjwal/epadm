"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import type { z } from "zod";

export function useServerForm<TValues extends FieldValues>(
  schema: z.ZodType<TValues, TValues>,
  defaultValues?: DefaultValues<TValues>,
) {
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const form = useForm<TValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleServerError = (error: unknown) => {
    if (error instanceof Error) setServerErrors([error.message]);
    else if (typeof error === "string") setServerErrors([error]);
    else setServerErrors(["An unexpected error occurred. Please try again."]);
  };

  const clearServerErrors = () => setServerErrors([]);

  return { form, serverErrors, handleServerError, clearServerErrors };
}
