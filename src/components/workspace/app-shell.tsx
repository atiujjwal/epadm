import type { ReactNode } from "react";
import { PageHeader as SharedPageHeader } from "@/components/layout/page-header";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b bg-surface px-6 pt-4">
      <SharedPageHeader title={title} description={subtitle} actions={actions} />
    </div>
  );
}
