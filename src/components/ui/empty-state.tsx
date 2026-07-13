import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** Icon rendered above the title (lucide-react or inline SVG). */
  icon?: ReactNode;
  /** Short, plain-language title. */
  title: string;
  /** One-sentence explanation — what this view shows when populated. */
  description?: string;
  /** Primary call-to-action (e.g. <Button>Add student</Button>). */
  action?: ReactNode;
}

/**
 * Empty state block for lists, tables, and card grids.
 *
 * Renders a centered, dashed-border box with an icon, title, description, and
 * optional CTA. Use whenever a data list can legally be empty — never leave a
 * blank section without explanation.
 *
 * @example
 * <EmptyState
 *   icon={<UsersIcon />}
 *   title="No students enrolled"
 *   description="Once students are added, their records will appear here."
 *   action={<Button href="/students/new" variant="primary">Add student</Button>}
 * />
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <div className="empty-state__title">{title}</div>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
