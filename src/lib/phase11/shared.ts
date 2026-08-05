import type { Permission } from "@/lib/db";

export class Phase11Error extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

export function phase11ApiError(error: unknown) {
  if (error instanceof Phase11Error) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[phase11]", error);
  return Response.json({ error: "Unexpected Phase 11 error." }, { status: 500 });
}

export function hasPermission(permissions: readonly Permission[], permission: Permission) {
  return permissions.includes(permission);
}

export function formatINR(paise?: number | null) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((paise ?? 0) / 100);
}

export function renderTemplate(template: string, variables: Record<string, unknown>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
    const path = key.split(".");
    let value: unknown = variables;
    for (const segment of path) {
      value = value && typeof value === "object" ? (value as Record<string, unknown>)[segment] : undefined;
    }
    return value == null ? "" : String(value);
  });
}
