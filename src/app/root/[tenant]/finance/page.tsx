import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/workspace/app-shell";

export default async function FinancePage() {
  await requirePermission("finance.fees.read");
  const modules = [
    { title: "Fees & Billing", href: "/finance/fees", description: "Structures, plans, invoices, collections, receipts, and overdue follow-up." },
    { title: "Accounting", href: "/finance/accounting", description: "Chart of accounts, manual expenses, and simplified P&L reporting." },
  ];
  return (
    <>
      <PageHeader title="Finance" subtitle="Fees, payments, and school accounting" />
      <div className="grid gap-4 p-6 md:grid-cols-2">
        {modules.map((module) => (
          <Card key={module.href} padding="lg">
            <h2 className="text-lg font-semibold">{module.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
            <Link href={module.href} className="mt-4 inline-flex text-sm font-medium text-primary">Open module →</Link>
          </Card>
        ))}
      </div>
    </>
  );
}
