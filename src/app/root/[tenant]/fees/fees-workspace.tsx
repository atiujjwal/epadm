"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import { invoices as mockInvoices, students } from "@/data/mock";
import {
  Home,
  Receipt,
  Search,
  XCircle,
  Wallet,
  Coins,
  BellRing,
  FileBarChart2,
  TrendingDown,
  ListChecks,
  Percent,
  Settings2,
  CalendarClock,
  Layers,
  DollarSign,
} from "lucide-react";

export type FeeInvoiceRow = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  studentName: string;
};

export type FeeStructureRow = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  academicYear: string;
  className: string;
};

export type FeesStats = {
  collected: number;
  billed: number;
  outstanding: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  feePlanCount: number;
  receiptCountToday: number;
  collectedToday: number;
};

type Props = {
  stats: FeesStats;
  invoices: FeeInvoiceRow[];
  feeStructures: FeeStructureRow[];
};

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function pct(n: number, d: number) {
  if (d <= 0) return "0%";
  return `${((n / d) * 100).toFixed(1)}%`;
}

function buildRail(pendingCount: number): InnerRailGroup[] {
  return [
    {
      label: "Operate",
      items: [
        { id: "home", label: "Home Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
        { id: "collect", label: "Collect Fee", icon: <Coins className="h-3.5 w-3.5" /> },
        { id: "receipt", label: "View Receipt", icon: <Receipt className="h-3.5 w-3.5" /> },
        { id: "search", label: "Search Receipts", icon: <Search className="h-3.5 w-3.5" /> },
        { id: "cancel", label: "Cancel Multiple", icon: <XCircle className="h-3.5 w-3.5" /> },
        { id: "account", label: "Fee Account", icon: <Wallet className="h-3.5 w-3.5" /> },
        { id: "misc", label: "Miscellaneous Fee", icon: <DollarSign className="h-3.5 w-3.5" /> },
        {
          id: "reminder",
          label: "Send Reminder",
          count: pendingCount || undefined,
          icon: <BellRing className="h-3.5 w-3.5" />,
        },
      ],
    },
    {
      label: "Reports",
      items: [
        { id: "card", label: "Fee Card", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
        { id: "collection", label: "Collection", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
        {
          id: "dues",
          label: "Dues",
          count: pendingCount || undefined,
          icon: <TrendingDown className="h-3.5 w-3.5" />,
        },
        { id: "register", label: "Register", icon: <ListChecks className="h-3.5 w-3.5" /> },
        { id: "rebate", label: "Rebate", icon: <Percent className="h-3.5 w-3.5" /> },
        { id: "status", label: "Status", icon: <ListChecks className="h-3.5 w-3.5" /> },
        { id: "rates", label: "View Rates", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
        { id: "diagnosis", label: "Diagnosis", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Configure",
      items: [
        { id: "cfg-head", label: "Annual Fee Head", icon: <Layers className="h-3.5 w-3.5" /> },
        { id: "cfg-fine", label: "Late Fine", icon: <Settings2 className="h-3.5 w-3.5" /> },
        { id: "cfg-structure", label: "Annual Fee Structure", icon: <Layers className="h-3.5 w-3.5" /> },
        { id: "cfg-annual-due", label: "Annual Due Dates", icon: <CalendarClock className="h-3.5 w-3.5" /> },
        { id: "cfg-due", label: "Due Dates (Class × Month)", icon: <CalendarClock className="h-3.5 w-3.5" /> },
        { id: "cfg-head-rates", label: "Fee Head Rates", icon: <Settings2 className="h-3.5 w-3.5" /> },
        { id: "cfg-item-rates", label: "Fee Item Rates", icon: <Settings2 className="h-3.5 w-3.5" /> },
        { id: "cfg-custom", label: "Custom Head Rates", icon: <Settings2 className="h-3.5 w-3.5" /> },
      ],
    },
  ];
}

const mockInv = (n: number) =>
  mockInvoices.slice(0, n).map((i) => [i.id, i.student, `₹${i.amount.toLocaleString()}`, i.due, i.status]);

function invoiceRows(invoices: FeeInvoiceRow[], limit = 20): (string | number)[][] {
  if (invoices.length === 0) return mockInv(limit);
  return invoices.slice(0, limit).map((inv) => [
    inv.id.slice(0, 8).toUpperCase(),
    inv.studentName,
    formatINR(inv.amount),
    inv.dueDate,
    inv.status,
  ]);
}

function buildFlows(
  stats: FeesStats,
  invoices: FeeInvoiceRow[],
  feeStructures: FeeStructureRow[],
): Record<string, ModuleFlow> {
  const liveRows = invoiceRows(invoices, 15);
  const pending = invoices.filter((i) => i.status === "pending" || i.status === "overdue");
  const paid = invoices.filter((i) => i.status === "paid");

  const collectionRate = pct(stats.collected, stats.billed);
  const outstandingAccounts = stats.pendingCount + stats.overdueCount;

  const rateRows =
    feeStructures.length > 0
      ? feeStructures.slice(0, 12).map((f) => [
          f.className,
          f.name,
          formatINR(f.amount),
          f.frequency,
          f.academicYear,
        ])
      : ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(
          (g, i) => [
            g,
            `₹${(28000 + i * 2000).toLocaleString()}`,
            `₹${(4500 + i * 200).toLocaleString()}`,
            `₹${(1200 + i * 100).toLocaleString()}`,
            `₹${(38000 + i * 2500).toLocaleString()}`,
          ],
        );

  return {
    home: {
      title: "Fees Dashboard",
      subtitle: "Session 2026–27 · Live collection view",
      ai:
        outstandingAccounts > 0
          ? `${outstandingAccounts} open invoice${outstandingAccounts === 1 ? "" : "s"} · ${collectionRate} of billed amount collected.`
          : "All invoices are settled. Generate the next billing cycle when ready.",
      stats: [
        {
          label: "Collected",
          value: formatINR(stats.collected),
          delta: `${stats.paidCount} paid`,
        },
        {
          label: "Billed",
          value: formatINR(stats.billed),
          delta: `${collectionRate} collected`,
        },
        {
          label: "Outstanding",
          value: formatINR(stats.outstanding),
          delta: `${outstandingAccounts} accounts`,
        },
        {
          label: "Today",
          value: formatINR(stats.collectedToday),
          delta: `${stats.receiptCountToday} receipts`,
        },
      ],
      columns: ["Receipt", "Student", "Amount", "Due", "Status"],
      rows: liveRows.slice(0, 10),
      emptyHint: invoices.length === 0 ? "No invoices yet — generate billing from fee structures." : undefined,
    },
    collect: {
      title: "Collect Fee",
      subtitle: "Record a new fee payment",
      primaryAction: "New Receipt",
      columns: ["Invoice", "Student", "Amount", "Due", "Status"],
      rows:
        pending.length > 0
          ? pending.slice(0, 12).map((inv) => [
              inv.title,
              inv.studentName,
              formatINR(inv.amount),
              inv.dueDate,
              inv.status,
            ])
          : students.slice(0, 8).map((s, i) => [
              `RCP-${9000 + i}`,
              s.name,
              `₹${(12000 + i * 1500).toLocaleString()}`,
              i % 2 ? "Online" : "Cash",
              "Paid",
            ]),
    },
    receipt: {
      title: "View Receipt",
      subtitle: "Look up any issued receipt",
      columns: ["Receipt", "Student", "Date", "Amount", "Status"],
      rows:
        paid.length > 0
          ? paid.slice(0, 12).map((inv) => [
              inv.id.slice(0, 8).toUpperCase(),
              inv.studentName,
              inv.dueDate,
              formatINR(inv.amount),
              inv.status,
            ])
          : mockInv(12).map((r) => [r[0], r[1], r[3], r[2], "UPI"]),
    },
    search: {
      title: "Search Receipts",
      subtitle: "Find receipts by student, date, or amount",
      columns: ["Receipt", "Student", "Amount", "Due", "Status"],
      rows: liveRows,
    },
    cancel: {
      title: "Cancel Multiple Receipts",
      subtitle: "Bulk reversal with audit trail",
      primaryAction: "Cancel Selected",
      columns: ["Receipt", "Student", "Amount", "Reason", "Status"],
      rows: mockInv(6).map((r) => [r[0], r[1], r[2], "Duplicate entry", "Pending"]),
    },
    account: {
      title: "Fee Account",
      subtitle: "Per-student ledger view",
      stats: [
        { label: "Invoices", value: String(invoices.length || "—") },
        { label: "In arrears", value: String(outstandingAccounts || "—") },
        { label: "Paid", value: String(stats.paidCount || "—") },
        { label: "Fee plans", value: String(stats.feePlanCount || "—") },
      ],
      columns: ["Student", "Title", "Amount", "Due", "Status"],
      rows: liveRows.slice(0, 10),
    },
    misc: {
      title: "Miscellaneous Fee",
      subtitle: "One-off charges: transport, uniforms, events",
      primaryAction: "Add Charge",
      columns: ["Item", "Class", "Amount", "Applied to", "Status"],
      rows: [
        ["Sports Kit", "All", "₹1,200", "—", "Active"],
        ["Field Trip · Grade 8", "Grade 8", "₹2,500", "—", "Active"],
        ["Lab Coat", "Grade 9-12", "₹850", "—", "Active"],
      ],
    },
    reminder: {
      title: "Send Reminder",
      subtitle: "Overdue and pending accounts",
      primaryAction: "Send Reminders",
      stats: [
        { label: "Overdue", value: String(stats.overdueCount) },
        { label: "Pending", value: String(stats.pendingCount) },
        { label: "Outstanding", value: formatINR(stats.outstanding) },
        { label: "Accounts", value: String(outstandingAccounts) },
      ],
      columns: ["Student", "Amount", "Due", "Status", "Title"],
      rows:
        pending.length > 0
          ? pending.slice(0, 10).map((inv) => [
              inv.studentName,
              formatINR(inv.amount),
              inv.dueDate,
              inv.status,
              inv.title,
            ])
          : students.slice(0, 10).map((s, i) => [
              s.name,
              `₹${(15000 + i * 3000).toLocaleString()}`,
              `${15 + i * 3}`,
              `${95 - i * 4}%`,
              "SMS + Email",
            ]),
    },
    card: {
      title: "Fee Card",
      subtitle: "Full fee history per student",
      columns: ["Student", "Head", "Billed", "Paid", "Balance"],
      rows: students.slice(0, 8).map((s) => [s.name, "Tuition Q2", "₹42,000", "₹42,000", "₹0"]),
    },
    collection: {
      title: "Collection Report",
      subtitle: "Live billed vs collected",
      stats: [
        { label: "Collected", value: formatINR(stats.collected) },
        { label: "Billed", value: formatINR(stats.billed) },
        { label: "Outstanding", value: formatINR(stats.outstanding) },
        { label: "Today", value: formatINR(stats.collectedToday) },
      ],
      columns: ["Receipt", "Student", "Amount", "Due", "Status"],
      rows: liveRows.slice(0, 10),
    },
    dues: {
      title: "Dues Report",
      subtitle: "Outstanding invoices",
      columns: ["Student", "Title", "Amount", "Due", "Status"],
      rows:
        pending.length > 0
          ? pending.slice(0, 15).map((inv) => [
              inv.studentName,
              inv.title,
              formatINR(inv.amount),
              inv.dueDate,
              inv.status,
            ])
          : [
              ["Grade 10-B", "18", "₹4.2 L", "45 days", "↑"],
              ["Grade 8-A", "12", "₹2.8 L", "22 days", "→"],
            ],
    },
    register: {
      title: "Fee Register",
      subtitle: "Full audit-ready ledger",
      columns: ["Receipt", "Student", "Amount", "Due", "Status"],
      rows: liveRows,
    },
    rebate: {
      title: "Rebate Report",
      subtitle: "Scholarships, sibling discounts, waivers",
      columns: ["Student", "Reason", "Amount", "Approved by", "Status"],
      rows: [
        ["Sara Menon", "Merit Scholarship", "₹18,000", "Principal", "Approved"],
        ["Rohan Das", "Sibling Discount", "₹6,000", "Auto", "Approved"],
        ["Kabir Sharma", "Financial Aid", "₹24,000", "Trustee", "Pending"],
      ],
    },
    status: {
      title: "Fee Status",
      subtitle: "Paid / Partial / Overdue overview",
      columns: ["Receipt", "Student", "Amount", "Due", "Status"],
      rows: liveRows,
    },
    rates: {
      title: "View Rates",
      subtitle: feeStructures.length > 0 ? "Live fee structures" : "Current fee schedule",
      columns:
        feeStructures.length > 0
          ? ["Class", "Fee", "Amount", "Frequency", "Year"]
          : ["Class", "Tuition", "Transport", "Lab", "Total/term"],
      rows: rateRows,
    },
    diagnosis: {
      title: "Fee Diagnosis",
      subtitle: "Data integrity checks",
      ai: `${stats.feePlanCount} fee plans · ${invoices.length} invoices · ${outstandingAccounts} open.`,
      stats: [
        { label: "Fee plans", value: String(stats.feePlanCount) },
        { label: "Invoices", value: String(invoices.length) },
        { label: "Open", value: String(outstandingAccounts) },
        { label: "Paid", value: String(stats.paidCount) },
      ],
      columns: ["Check", "Result", "Details", "Action", "Status"],
      rows: [
        [
          "Fee plans configured",
          stats.feePlanCount > 0 ? "OK" : "Warning",
          `${stats.feePlanCount} plans`,
          stats.feePlanCount > 0 ? "-" : "Add plan",
          stats.feePlanCount > 0 ? "OK" : "Warning",
        ],
        [
          "Open invoices",
          outstandingAccounts > 0 ? "Info" : "OK",
          `${outstandingAccounts} open`,
          outstandingAccounts > 0 ? "Collect" : "-",
          outstandingAccounts > 0 ? "Info" : "OK",
        ],
      ],
    },
    "cfg-head": {
      title: "Annual Fee Head",
      subtitle: "Fee categories (Tuition, Transport, Lab, etc.)",
      primaryAction: "Add Head",
      columns: ["Head", "Type", "Frequency", "Taxable", "Status"],
      rows: [
        ["Tuition", "Academic", "Quarterly", "No", "Active"],
        ["Transport", "Facility", "Monthly", "No", "Active"],
        ["Lab", "Academic", "Yearly", "Yes", "Active"],
        ["Library", "Facility", "Yearly", "No", "Active"],
        ["Sports", "Activity", "Yearly", "No", "Active"],
      ],
    },
    "cfg-fine": {
      title: "Late Fine",
      subtitle: "Configure penalty rules",
      columns: ["Rule", "Days after due", "Amount", "Type", "Status"],
      rows: [
        ["Standard", "7", "₹50/day", "Per day", "Active"],
        ["Grace 15+", "15", "₹500", "Flat", "Active"],
        ["Grace 30+", "30", "₹1,500", "Flat", "Active"],
      ],
    },
    "cfg-structure": {
      title: "Annual Fee Structure",
      subtitle: feeStructures.length > 0 ? "Live class × fee matrix" : "Class × head matrix",
      columns:
        feeStructures.length > 0
          ? ["Class", "Fee", "Amount", "Frequency", "Year"]
          : ["Class", "Tuition", "Transport", "Lab", "Total"],
      rows: rateRows,
    },
    "cfg-annual-due": {
      title: "Annual Due Dates",
      subtitle: "Session-wide due date defaults",
      columns: ["Quarter", "Start", "Due", "Grace end", "Status"],
      rows: [
        ["Q1", "2026-04-01", "2026-04-15", "2026-04-30", "Active"],
        ["Q2", "2026-07-01", "2026-07-15", "2026-07-30", "Active"],
        ["Q3", "2026-10-01", "2026-10-15", "2026-10-30", "Active"],
        ["Q4", "2027-01-01", "2027-01-15", "2027-01-30", "Active"],
      ],
    },
    "cfg-due": {
      title: "Due Dates · Class × Month",
      subtitle: "Fine-grained overrides",
      columns: ["Class", "Month", "Due", "Grace", "Status"],
      rows: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(
        (g) => [g, "Jul 2026", "2026-07-15", "2026-07-30", "Active"],
      ),
    },
    "cfg-head-rates": {
      title: "Fee Head Rates",
      subtitle: "Rate per head per class",
      columns: ["Head", "Class", "Rate", "Effective", "Status"],
      rows: [
        ["Tuition", "Grade 10", "₹32,000", "2026-04-01", "Active"],
        ["Transport", "Grade 10", "₹20,500", "2026-04-01", "Active"],
        ["Lab", "Grade 10", "₹6,000", "2026-04-01", "Active"],
      ],
    },
    "cfg-item-rates": {
      title: "Fee Item Rates",
      subtitle: "Individual item rates within a head",
      columns: ["Item", "Head", "Rate", "Class", "Status"],
      rows: [
        ["Physics Lab", "Lab", "₹2,000", "Grade 11", "Active"],
        ["Chemistry Lab", "Lab", "₹2,000", "Grade 11", "Active"],
        ["Biology Lab", "Lab", "₹2,000", "Grade 11", "Active"],
      ],
    },
    "cfg-custom": {
      title: "Custom Head Rates",
      subtitle: "One-off overrides and bulk upload",
      primaryAction: "Bulk Upload",
      columns: ["Student", "Head", "Custom rate", "Reason", "Status"],
      rows: [
        ["Sara Menon", "Tuition", "₹14,000", "Scholarship", "Active"],
        ["Rohan Das", "Transport", "₹0", "Own vehicle", "Active"],
      ],
    },
  };
}

export function FeesWorkspace({ stats, invoices, feeStructures }: Props) {
  const outstandingAccounts = stats.pendingCount + stats.overdueCount;
  const rail = buildRail(outstandingAccounts);
  const flows = buildFlows(stats, invoices, feeStructures);

  return (
    <ModuleShell
      title="Fees"
      subtitle={`${invoices.length.toLocaleString()} invoices · ${stats.feePlanCount} fee plans · live`}
      rail={rail}
      flows={flows}
      defaultFlow="home"
    />
  );
}
