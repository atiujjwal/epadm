import { notFound } from "next/navigation";

/**
 * Catch-all retained only as a safety net. Every design module now has a
 * dedicated route under `src/app/root/[tenant]/<module>/page.tsx`.
 */
export default async function TenantModulePage({
  params,
}: {
  params: Promise<{ module: string[] }>;
}) {
  const { module } = await params;
  console.warn(`[tenant catch-all] Unmatched module path: /${module.join("/")}`);
  notFound();
}
