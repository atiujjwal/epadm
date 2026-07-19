import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/30 max-w-sm mx-auto">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-[280px] mb-4 leading-normal">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;
