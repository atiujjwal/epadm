// EPADM Layout Components - Barrel Exports
// Re-export all layout components from a single entry point

import { PageHeaderStyles } from "./page-header";
import { AdminSidebarStyles } from "./admin-sidebar";
import { TenantSidebarStyles } from "./tenant-sidebar";

export { PageHeader, PageHeaderStyles } from "./page-header";
export type { PageHeaderProps } from "./page-header";

export { AdminSidebar, AdminSidebarStyles } from "./admin-sidebar";
export type { AdminSidebarProps } from "./admin-sidebar";

export { TenantSidebar, TenantSidebarStyles } from "./tenant-sidebar";
export type { TenantSidebarProps } from "./tenant-sidebar";

// Helper to render all layout styles globally (call once in root layout)
export function renderLayoutStyles() {
  return (
    <>
      <PageHeaderStyles />
      <AdminSidebarStyles />
      <TenantSidebarStyles />
    </>
  );
}