import type { ReactNode } from "react";
import { getPlatformCtx } from "@/lib/platform/context";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminShellProvider } from "@/components/layout/admin-shell-context";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import {
  Building2,
  Layers,
  MessageSquare,
  Package,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type Props = { children: ReactNode };

export default async function AdminLayout({ children }: Props) {
  let ctx: Awaited<ReturnType<typeof getPlatformCtx>> | null = null;

  try {
    ctx = await getPlatformCtx();
  } catch {
    ctx = null;
  }

  // Unauthenticated (e.g. /admin/login): no operator shell, but still own the
  // single <main id="main-content"> so the global skip-link resolves.
  if (!ctx) {
    return (
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    );
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: <Layers className="h-4 w-4" /> },
    { href: "/admin/tenants", label: "School Tenants", icon: <Building2 className="h-4 w-4" /> },
    { label: "Plans & Modules", icon: <Package className="h-4 w-4" />, disabled: true },
    { label: "Billing & Invoices", icon: <Package className="h-4 w-4" />, disabled: true },
    { label: "SMS / WhatsApp", icon: <MessageSquare className="h-4 w-4" />, disabled: true },
    { href: "/admin/ai", label: "AI Services", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Platform Users", icon: <Users className="h-4 w-4" />, disabled: true },
    { href: "/admin/audit", label: "Audit Log", icon: <ShieldCheck className="h-4 w-4" /> },
    { href: "/admin/infrastructure", label: "Infrastructure", icon: <Server className="h-4 w-4" /> },
  ];

  return (
    <AdminShellProvider>
      <div className="admin-theme min-h-screen bg-background text-foreground flex">
        <AdminSidebar
          items={navItems}
          operatorName={ctx.name}
          operatorEmail={ctx.email}
        />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <AdminTopbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-6 min-w-0 overflow-x-auto space-y-6"
          >
            {children}
          </main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
