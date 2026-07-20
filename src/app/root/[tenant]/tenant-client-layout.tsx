"use client";

import type { ReactNode } from "react";
import { AppShell, type TenantShellCtx } from "@/components/workspace/app-shell";

type Props = {
  children: ReactNode;
  ctx: TenantShellCtx;
};

export function TenantClientLayout({ children, ctx }: Props) {
  return <AppShell ctx={ctx}>{children}</AppShell>;
}
