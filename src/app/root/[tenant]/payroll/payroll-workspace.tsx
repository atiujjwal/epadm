"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { PayrollRecord } from "@/lib/admin/payroll";

type Props = {
  initialPayroll: PayrollRecord[];
};

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function payrollDashboardRows(records: PayrollRecord[]): string[][] {
  return records.map((r) => {
    const gross = r.basicSalary + r.allowances;
    const net = gross - r.deductions;
    return [
      r.employeeCode,
      r.staffName,
      r.department ?? "—",
      formatInr(gross),
      formatInr(r.deductions),
      formatInr(net),
      r.paymentStatus,
    ];
  });
}

function payrollRegisterRows(records: PayrollRecord[]): string[][] {
  const byPeriod = new Map<
    string,
    { count: number; gross: number; deductions: number; net: number }
  >();

  for (const r of records) {
    const gross = r.basicSalary + r.allowances;
    const net = gross - r.deductions;
    const bucket = byPeriod.get(r.payPeriod) ?? { count: 0, gross: 0, deductions: 0, net: 0 };
    bucket.count += 1;
    bucket.gross += gross;
    bucket.deductions += r.deductions;
    bucket.net += net;
    byPeriod.set(r.payPeriod, bucket);
  }

  return [...byPeriod.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([period, stats]) => [
      period,
      String(stats.count),
      formatInr(stats.gross),
      formatInr(stats.deductions),
      formatInr(stats.net),
      formatInr(Math.round(stats.gross * 0.12)),
    ]);
}

function sumGross(records: PayrollRecord[]) {
  return records.reduce((sum, r) => sum + r.basicSalary + r.allowances, 0);
}

function sumDeductions(records: PayrollRecord[]) {
  return records.reduce((sum, r) => sum + r.deductions, 0);
}

function buildFlows(records: PayrollRecord[]): Record<string, ModuleFlow> {
  const dashRows = payrollDashboardRows(records);
  const registerRows = payrollRegisterRows(records);
  const gross = sumGross(records);
  const deductions = sumDeductions(records);
  const net = gross - deductions;
  const pending = records.filter((r) => r.paymentStatus !== "paid").length;

  const mockDashRows = [
    ["EMP-0031", "Anita Rao", "Mathematics", "₹68,400", "₹9,200", "₹59,200", "Approved"],
    ["EMP-0044", "Suresh Iyer", "Physics", "₹72,000", "₹10,100", "₹61,900", "Pending"],
    ["EMP-0059", "Farah Sheikh", "Admin", "₹48,200", "₹6,400", "₹41,800", "Approved"],
    ["EMP-0072", "Vikram Bose", "Sports", "₹52,000", "₹6,900", "₹45,100", "Draft"],
  ];

  const mockRegisterRows = [
    ["Jul 2026", "128", "₹34.6 L", "₹5.7 L", "₹28.9 L", "₹4.2 L"],
    ["Jun 2026", "127", "₹33.8 L", "₹5.5 L", "₹28.3 L", "₹4.1 L"],
    ["May 2026", "127", "₹33.5 L", "₹5.4 L", "₹28.1 L", "₹4.0 L"],
  ];

  return {
    dashboard: {
      title: "Payroll · July 2026",
      subtitle:
        records.length > 0
          ? `${records.length} payroll record${records.length === 1 ? "" : "s"} loaded`
          : "128 employees · Cycle closes 28 Jul · Bank release 1 Aug",
      ai: "Copilot: 3 attendance disputes will delay ₹42,400 in variable pay. Approving today keeps you on the 28 Jul close.",
      stats: [
        {
          label: "Gross Payroll",
          value: records.length > 0 ? formatInr(gross) : "₹34.6 L",
          delta: records.length > 0 ? undefined : "+2.1% vs Jun",
        },
        { label: "Net Payable", value: records.length > 0 ? formatInr(net) : "₹28.9 L" },
        {
          label: "Statutory",
          value: records.length > 0 ? formatInr(Math.round(gross * 0.12)) : "₹4.2 L",
          delta: records.length > 0 ? undefined : "PF ₹2.6 · ESI ₹0.4 · PT ₹0.2",
        },
        { label: "Pending Approvals", value: records.length > 0 ? String(pending) : "4" },
      ],
      columns: ["Emp ID", "Name", "Dept", "Gross", "Deductions", "Net", "Status"],
      rows: dashRows.length > 0 ? dashRows : mockDashRows,
      primaryAction: "Run July payroll",
    },
    run: {
      title: "Run Payroll",
      subtitle: "Load attendance → apply structure → review variances → freeze cycle.",
      ai: "Attendance sync is complete. 6 employees have >2 unauthorised absences — flag for LOP review before freezing.",
      stats: [
        { label: "Cycle", value: "Jul 2026" },
        { label: "Employees", value: records.length > 0 ? String(records.length) : "128" },
        { label: "LOP Days", value: "17" },
        { label: "Overtime Hrs", value: "42" },
      ],
      columns: ["Step", "Owner", "Status", "ETA"],
      rows: [
        ["01 · Pull attendance", "System", "Success", "Done"],
        ["02 · Apply salary structure", "System", "Success", "Done"],
        ["03 · LOP & overtime review", "HR Manager", "Pending", "Today 5pm"],
        ["04 · Freeze cycle", "Principal", "Draft", "27 Jul"],
        ["05 · Generate bank file", "Finance", "Draft", "31 Jul"],
      ],
      primaryAction: "Advance step",
    },
    slips: {
      title: "Salary Slips",
      subtitle: "Send digitally to email + parent app · signed PDF with QR verification.",
      columns: ["Emp ID", "Name", "Cycle", "Net", "Delivered", "Status"],
      rows:
        dashRows.length > 0
          ? dashRows.slice(0, 6).map((r) => [r[0], r[1], "Latest", r[5], "Email", r[6]])
          : [
              ["EMP-0031", "Anita Rao", "Jun 2026", "₹58,900", "Email + App", "Delivered"],
              ["EMP-0044", "Suresh Iyer", "Jun 2026", "₹61,200", "Email", "Delivered"],
              ["EMP-0059", "Farah Sheikh", "Jun 2026", "₹41,800", "Email", "Sent"],
            ],
      primaryAction: "Generate & send",
    },
    bonus: {
      title: "Bonuses & Deductions",
      columns: ["Emp", "Type", "Reason", "Amount", "Cycle", "Status"],
      rows: [
        ["Anita Rao", "Bonus", "Board results", "₹12,000", "Jul 2026", "Approved"],
        ["Suresh Iyer", "Deduction", "Late arrivals ×3", "-₹1,500", "Jul 2026", "Pending"],
        ["Vikram Bose", "Bonus", "Sports championship", "₹8,000", "Jul 2026", "Draft"],
      ],
      primaryAction: "Add adjustment",
    },
    advances: {
      title: "Advances & Loans",
      columns: ["Emp", "Type", "Principal", "EMI", "Remaining", "Status"],
      rows: [
        ["Farah Sheikh", "Salary advance", "₹40,000", "₹10,000", "₹20,000", "Active"],
        ["Vikram Bose", "Vehicle loan", "₹1,50,000", "₹6,250", "₹87,500", "Active"],
      ],
      primaryAction: "New advance",
    },
    reimbursements: {
      title: "Reimbursements",
      columns: ["Emp", "Category", "Amount", "Submitted", "Status"],
      rows: [
        ["Anita Rao", "Books & journals", "₹3,200", "12 Jul", "Pending"],
        ["Suresh Iyer", "Travel", "₹1,850", "10 Jul", "Approved"],
      ],
      primaryAction: "New claim",
    },
    approvals: {
      title: "Approvals Queue",
      subtitle: "4 items waiting on you.",
      columns: ["Item", "Requestor", "Amount", "Age", "Action"],
      rows: [
        ["Bonus · Board results", "HR Manager", "₹12,000", "1d", "Pending"],
        ["Advance · Salary", "Farah Sheikh", "₹40,000", "2d", "Pending"],
        ["Reimburse · Books", "Anita Rao", "₹3,200", "3h", "Pending"],
        ["Overtime · Sports meet", "Vikram Bose", "₹4,500", "1d", "Pending"],
      ],
    },
    "bank-file": {
      title: "Bank File Export",
      subtitle: "NEFT / IMPS batch · HDFC & SBI corporate net-banking formats.",
      stats: [
        { label: "Batch", value: "Jul-2026-01" },
        { label: "Employees", value: records.length > 0 ? String(records.length) : "126" },
        { label: "Amount", value: records.length > 0 ? formatInr(net) : "₹28.6 L" },
        { label: "Bank", value: "HDFC Corp" },
      ],
      emptyHint: "Freeze the July cycle to enable batch generation.",
      primaryAction: "Generate NEFT file",
    },
    register: {
      title: "Payroll Register",
      columns: ["Month", "Employees", "Gross", "Deductions", "Net", "Statutory"],
      rows: registerRows.length > 0 ? registerRows : mockRegisterRows,
    },
    tds: {
      title: "TDS Statement (Form 24Q)",
      columns: ["Quarter", "Employees", "Tax Deducted", "Deposited", "Status"],
      rows: [
        ["Q1 · FY 26-27", "128", "₹6.4 L", "₹6.4 L", "Delivered"],
        ["Q4 · FY 25-26", "127", "₹7.2 L", "₹7.2 L", "Delivered"],
      ],
    },
    statutory: {
      title: "PF · ESI · Professional Tax",
      columns: ["Head", "Cycle", "Employees", "Employer", "Total", "Challan"],
      rows: [
        ["EPF", "Jul 2026", "₹1.3 L", "₹1.3 L", "₹2.6 L", "Pending"],
        ["ESI", "Jul 2026", "₹0.14 L", "₹0.26 L", "₹0.40 L", "Pending"],
        ["Prof. Tax", "Jul 2026", "₹0.20 L", "—", "₹0.20 L", "Pending"],
      ],
    },
    structures: {
      title: "Salary Structures",
      columns: ["Structure", "Applies to", "Basic %", "HRA %", "Special", "Employees"],
      rows: [
        ["Teaching · Senior", "PGT", "50", "20", "30", "42"],
        ["Teaching · Middle", "TGT", "50", "20", "30", "38"],
        ["Non-Teaching · Admin", "Office", "45", "20", "35", "18"],
        ["Support", "Peon, Driver, Cook", "60", "10", "30", "30"],
      ],
      primaryAction: "New structure",
    },
    components: {
      title: "Salary Components",
      columns: ["Component", "Type", "Taxable", "Statutory", "Formula"],
      rows: [
        ["Basic", "Earning", "Yes", "PF, ESI", "50% of CTC"],
        ["HRA", "Earning", "Partial", "—", "20% of Basic"],
        ["Special Allowance", "Earning", "Yes", "—", "Balancing"],
        ["PF (Employee)", "Deduction", "—", "PF", "12% of Basic"],
        ["Professional Tax", "Deduction", "—", "PT", "Slab based"],
      ],
      primaryAction: "New component",
    },
    grades: {
      title: "Salary Grades",
      columns: ["Grade", "Min", "Mid", "Max", "Employees"],
      rows: [
        ["G1 · Support", "₹18,000", "₹24,000", "₹32,000", "30"],
        ["G2 · Admin", "₹28,000", "₹38,000", "₹52,000", "18"],
        ["G3 · TGT", "₹42,000", "₹54,000", "₹72,000", "38"],
        ["G4 · PGT", "₹58,000", "₹74,000", "₹96,000", "42"],
      ],
      primaryAction: "New grade",
    },
  };
}

const rail = [
  {
    label: "Operate",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "run", label: "Run Payroll" },
      { id: "slips", label: "Salary Slips" },
      { id: "bonus", label: "Bonuses & Deductions" },
      { id: "advances", label: "Advances & Loans" },
      { id: "reimbursements", label: "Reimbursements" },
      { id: "approvals", label: "Approvals", count: 4 },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "register", label: "Payroll Register" },
      { id: "tds", label: "TDS Statement" },
      { id: "statutory", label: "PF / ESI / PT" },
      { id: "bank-file", label: "Bank File Export" },
    ],
  },
  {
    label: "Configure",
    items: [
      { id: "structures", label: "Salary Structures" },
      { id: "components", label: "Components" },
      { id: "grades", label: "Salary Grades" },
    ],
  },
];

export function PayrollWorkspace({ initialPayroll }: Props) {
  const flows = buildFlows(initialPayroll);

  return (
    <ModuleShell
      title="Payroll"
      subtitle={
        initialPayroll.length > 0
          ? `${initialPayroll.length} payroll record${initialPayroll.length === 1 ? "" : "s"} · salary cycles and statutory filings`
          : "Salary structures, cycles, statutory filings and bank release — all in one place."
      }
      rail={rail}
      flows={flows}
      defaultFlow="dashboard"
    />
  );
}
