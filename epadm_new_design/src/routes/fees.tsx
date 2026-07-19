import { createFileRoute } from "@tanstack/react-router";
import { ModuleShell } from "@/components/module-shell";
import type { InnerRailGroup } from "@/components/inner-rail";
import type { ModuleFlow } from "@/components/module-shell";
import { invoices, students } from "@/data/mock";
import { Home, Receipt, Search, XCircle, Wallet, Coins, BellRing, FileBarChart2, TrendingDown, ListChecks, Percent, Settings2, CalendarClock, Layers, DollarSign } from "lucide-react";

export const Route = createFileRoute("/fees")({
  head: () => ({ meta: [{ title: "Fees · EPADM" }, { name: "description", content: "Fee collection, receipts, reminders, dues and configuration." }] }),
  component: FeesPage,
});

const rail: InnerRailGroup[] = [
  { label: "Operate", items: [
    { id: "home", label: "Home Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    { id: "collect", label: "Collect Fee", icon: <Coins className="h-3.5 w-3.5" /> },
    { id: "receipt", label: "View Receipt", icon: <Receipt className="h-3.5 w-3.5" /> },
    { id: "search", label: "Search Receipts", icon: <Search className="h-3.5 w-3.5" /> },
    { id: "cancel", label: "Cancel Multiple", icon: <XCircle className="h-3.5 w-3.5" /> },
    { id: "account", label: "Fee Account", icon: <Wallet className="h-3.5 w-3.5" /> },
    { id: "misc", label: "Miscellaneous Fee", icon: <DollarSign className="h-3.5 w-3.5" /> },
    { id: "reminder", label: "Send Reminder", count: 142, icon: <BellRing className="h-3.5 w-3.5" /> },
  ]},
  { label: "Reports", items: [
    { id: "card", label: "Fee Card", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    { id: "collection", label: "Collection", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    { id: "dues", label: "Dues", count: 142, icon: <TrendingDown className="h-3.5 w-3.5" /> },
    { id: "register", label: "Register", icon: <ListChecks className="h-3.5 w-3.5" /> },
    { id: "rebate", label: "Rebate", icon: <Percent className="h-3.5 w-3.5" /> },
    { id: "status", label: "Status", icon: <ListChecks className="h-3.5 w-3.5" /> },
    { id: "rates", label: "View Rates", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    { id: "diagnosis", label: "Diagnosis", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
  ]},
  { label: "Configure", items: [
    { id: "cfg-head", label: "Annual Fee Head", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "cfg-fine", label: "Late Fine", icon: <Settings2 className="h-3.5 w-3.5" /> },
    { id: "cfg-structure", label: "Annual Fee Structure", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "cfg-annual-due", label: "Annual Due Dates", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { id: "cfg-due", label: "Due Dates (Class × Month)", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { id: "cfg-head-rates", label: "Fee Head Rates", icon: <Settings2 className="h-3.5 w-3.5" /> },
    { id: "cfg-item-rates", label: "Fee Item Rates", icon: <Settings2 className="h-3.5 w-3.5" /> },
    { id: "cfg-custom", label: "Custom Head Rates", icon: <Settings2 className="h-3.5 w-3.5" /> },
  ]},
];

const inv = (n: number) => invoices.slice(0, n).map(i => [i.id, i.student, `₹${i.amount.toLocaleString()}`, i.due, i.status]);

const flows: Record<string, ModuleFlow> = {
  home: {
    title: "Fees Dashboard",
    subtitle: "Session 2026–27 · Real-time collection view",
    ai: "Collection is 12.4% ahead of last month. 8 accounts are predicted to default next cycle — send targeted reminders.",
    stats: [
      { label: "Collected (MTD)", value: "₹1.42 Cr", delta: "+12.4% vs LM" },
      { label: "Billed (MTD)", value: "₹1.68 Cr", delta: "84.5% collected" },
      { label: "Outstanding", value: "₹26.1 L", delta: "142 accounts" },
      { label: "Today", value: "₹8.42 L", delta: "47 receipts" },
    ],
    columns: ["Receipt", "Student", "Amount", "Due", "Status"],
    rows: inv(10),
  },
  collect: { title: "Collect Fee", subtitle: "Record a new fee payment", primaryAction: "New Receipt",
    columns: ["Receipt", "Student", "Amount", "Mode", "Status"],
    rows: students.slice(0, 8).map((s, i) => [`RCP-${9000+i}`, s.name, `₹${(12000+i*1500).toLocaleString()}`, i%2?"Online":"Cash", "Paid"]) },
  receipt: { title: "View Receipt", subtitle: "Look up any issued receipt", columns: ["Receipt", "Student", "Date", "Amount", "Mode"], rows: inv(12).map(r => [r[0], r[1], r[3], r[2], "UPI"]) },
  search: { title: "Search Receipts", subtitle: "Find receipts by student, date, or amount", columns: ["Receipt", "Student", "Amount", "Due", "Status"], rows: inv(15) },
  cancel: { title: "Cancel Multiple Receipts", subtitle: "Bulk reversal with audit trail", primaryAction: "Cancel Selected", columns: ["Receipt", "Student", "Amount", "Reason", "Status"], rows: inv(6).map(r => [r[0], r[1], r[2], "Duplicate entry", "Pending"]) },
  account: { title: "Fee Account", subtitle: "Per-student ledger view", stats: [{ label: "Active accounts", value: "2,847" }, { label: "In arrears", value: "142" }, { label: "Credit balance", value: "₹4.2 L" }, { label: "Rebates YTD", value: "₹8.1 L" }], columns: ["Student", "Class", "Billed", "Collected", "Balance"], rows: students.slice(0, 10).map(s => [s.name, `${s.grade}-${s.section}`, "₹1,42,000", "₹1,18,000", "₹24,000"]) },
  misc: { title: "Miscellaneous Fee", subtitle: "One-off charges: transport, uniforms, events", primaryAction: "Add Charge", columns: ["Item", "Class", "Amount", "Applied to", "Status"], rows: [["Sports Kit", "All", "₹1,200", "2,847", "Active"], ["Field Trip · Grade 8", "Grade 8", "₹2,500", "384", "Active"], ["Lab Coat", "Grade 9-12", "₹850", "1,542", "Active"]] },
  reminder: { title: "Send Reminder", subtitle: "AI-prioritised list of overdue accounts", ai: "Copilot ranked 142 overdue accounts by likelihood-to-pay. Sending SMS + email to top 40 recovers ~₹18 L historically.", primaryAction: "Send Reminders", stats: [{ label: "Overdue", value: "142" }, { label: "Predicted recovery", value: "₹18.2 L" }, { label: "Last batch", value: "3 days ago" }, { label: "Response rate", value: "38%" }], columns: ["Student", "Amount", "Days overdue", "Score", "Channel"], rows: students.slice(0, 10).map((s, i) => [s.name, `₹${(15000+i*3000).toLocaleString()}`, `${15+i*3}`, `${95-i*4}%`, "SMS + Email"]) },
  card: { title: "Fee Card", subtitle: "Full fee history per student", columns: ["Student", "Head", "Billed", "Paid", "Balance"], rows: students.slice(0, 8).map(s => [s.name, "Tuition Q2", "₹42,000", "₹42,000", "₹0"]) },
  collection: { title: "Collection Report", subtitle: "Daily / monthly collection breakdown", stats: [{label:"Today",value:"₹8.42 L"},{label:"This week",value:"₹42.1 L"},{label:"MTD",value:"₹1.42 Cr"},{label:"YTD",value:"₹8.94 Cr"}], columns: ["Date", "Receipts", "Cash", "Online", "Total"], rows: Array.from({length:8}).map((_,i)=>[`2026-07-${15-i}`, `${40+i*3}`, `₹${(1_50_000+i*20000).toLocaleString()}`, `₹${(5_00_000+i*40000).toLocaleString()}`, `₹${(6_50_000+i*60000).toLocaleString()}`]) },
  dues: { title: "Dues Report", subtitle: "Outstanding by class and aging bucket", columns: ["Class", "Students", "Amount", "Aging", "Trend"], rows: [["Grade 10-B", "18", "₹4.2 L", "45 days", "↑"], ["Grade 8-A", "12", "₹2.8 L", "22 days", "→"], ["Grade 11-C", "9", "₹2.1 L", "38 days", "↓"], ["Grade 7-B", "14", "₹1.9 L", "18 days", "→"]] },
  register: { title: "Fee Register", subtitle: "Full audit-ready ledger", columns: ["Receipt", "Student", "Amount", "Due", "Status"], rows: inv(20) },
  rebate: { title: "Rebate Report", subtitle: "Scholarships, sibling discounts, waivers", columns: ["Student", "Reason", "Amount", "Approved by", "Status"], rows: [["Sara Menon", "Merit Scholarship", "₹18,000", "Principal", "Approved"], ["Rohan Das", "Sibling Discount", "₹6,000", "Auto", "Approved"], ["Kabir Sharma", "Financial Aid", "₹24,000", "Trustee", "Pending"]] },
  status: { title: "Fee Status", subtitle: "Paid / Partial / Overdue overview", columns: ["Student", "Class", "Amount", "Due", "Status"], rows: inv(15) },
  rates: { title: "View Rates", subtitle: "Current fee schedule", columns: ["Class", "Tuition", "Transport", "Lab", "Total/term"], rows: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map((g,i)=>[g,`₹${(28000+i*2000).toLocaleString()}`,`₹${(4500+i*200).toLocaleString()}`,`₹${(1200+i*100).toLocaleString()}`,`₹${(38000+i*2500).toLocaleString()}`]) },
  diagnosis: { title: "Fee Diagnosis", subtitle: "Data integrity checks", ai: "3 mismatches detected between fee heads and structure. 2 students have negative balances — investigate.", stats: [{label:"Checks",value:"18"},{label:"Passed",value:"15"},{label:"Warnings",value:"3"},{label:"Errors",value:"0"}], columns: ["Check", "Result", "Details", "Action", "Status"], rows: [["Head/Structure sync", "Warning", "3 heads unmapped", "Review", "Warning"], ["Negative balances", "Warning", "2 accounts", "Fix", "Warning"], ["Duplicate receipts", "OK", "0 found", "-", "OK"]] },
  "cfg-head": { title: "Annual Fee Head", subtitle: "Fee categories (Tuition, Transport, Lab, etc.)", primaryAction: "Add Head", columns: ["Head", "Type", "Frequency", "Taxable", "Status"], rows: [["Tuition","Academic","Quarterly","No","Active"],["Transport","Facility","Monthly","No","Active"],["Lab","Academic","Yearly","Yes","Active"],["Library","Facility","Yearly","No","Active"],["Sports","Activity","Yearly","No","Active"]] },
  "cfg-fine": { title: "Late Fine", subtitle: "Configure penalty rules", columns: ["Rule", "Days after due", "Amount", "Type", "Status"], rows: [["Standard", "7", "₹50/day", "Per day", "Active"], ["Grace 15+", "15", "₹500", "Flat", "Active"], ["Grace 30+", "30", "₹1,500", "Flat", "Active"]] },
  "cfg-structure": { title: "Annual Fee Structure", subtitle: "Class × head matrix", columns: ["Class", "Tuition", "Transport", "Lab", "Total"], rows: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map((g,i)=>[g,`₹${(28000+i*2000).toLocaleString()}`,`₹${(18000+i*500).toLocaleString()}`,`₹${(4800+i*400).toLocaleString()}`,`₹${(50800+i*2900).toLocaleString()}`]) },
  "cfg-annual-due": { title: "Annual Due Dates", subtitle: "Session-wide due date defaults", columns: ["Quarter", "Start", "Due", "Grace end", "Status"], rows: [["Q1","2026-04-01","2026-04-15","2026-04-30","Active"],["Q2","2026-07-01","2026-07-15","2026-07-30","Active"],["Q3","2026-10-01","2026-10-15","2026-10-30","Active"],["Q4","2027-01-01","2027-01-15","2027-01-30","Active"]] },
  "cfg-due": { title: "Due Dates · Class × Month", subtitle: "Fine-grained overrides", columns: ["Class", "Month", "Due", "Grace", "Status"], rows: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map(g=>[g,"Jul 2026","2026-07-15","2026-07-30","Active"]) },
  "cfg-head-rates": { title: "Fee Head Rates", subtitle: "Rate per head per class", columns: ["Head", "Class", "Rate", "Effective", "Status"], rows: [["Tuition","Grade 10","₹32,000","2026-04-01","Active"],["Transport","Grade 10","₹20,500","2026-04-01","Active"],["Lab","Grade 10","₹6,000","2026-04-01","Active"]] },
  "cfg-item-rates": { title: "Fee Item Rates", subtitle: "Individual item rates within a head", columns: ["Item", "Head", "Rate", "Class", "Status"], rows: [["Physics Lab","Lab","₹2,000","Grade 11","Active"],["Chemistry Lab","Lab","₹2,000","Grade 11","Active"],["Biology Lab","Lab","₹2,000","Grade 11","Active"]] },
  "cfg-custom": { title: "Custom Head Rates", subtitle: "One-off overrides and bulk upload", primaryAction: "Bulk Upload", columns: ["Student", "Head", "Custom rate", "Reason", "Status"], rows: [["Sara Menon","Tuition","₹14,000","Scholarship","Active"],["Rohan Das","Transport","₹0","Own vehicle","Active"]] },
};

function FeesPage() {
  return <ModuleShell title="Fees" subtitle="Session 2026–27 · Complete fee lifecycle" rail={rail} flows={flows} defaultFlow="home" />;
}
