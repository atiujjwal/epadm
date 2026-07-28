import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";

export default async function TenantLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
