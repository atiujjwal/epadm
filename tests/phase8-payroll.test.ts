import { describe, expect, it, vi } from "vitest";
import { Pool } from "pg";

vi.mock("server-only", () => ({}));

import { amountToWords, computePayrollAmounts } from "@/lib/phase8/payroll";

const PHASE8_TABLES = [
  "payroll_components",
  "payroll_component_assignments",
  "payroll_settings",
  "payroll_runs",
  "payroll_run_entries",
  "payroll_run_entry_lines",
  "payslips",
  "staff_loans",
  "staff_contracts",
  "recruitment_postings",
  "recruitment_applications",
  "recruitment_interviews",
  "recruitment_offers",
  "performance_cycles",
  "performance_reviews",
  "staff_leave_types",
  "staff_leave_balances",
  "staff_leave_requests",
] as const;

const components = [
  { id: "basic", code: "BASIC", name: "Basic Salary", componentType: "earning", calcType: "fixed", isPfApplicable: true, displayOrder: 1 },
  { id: "hra", code: "HRA", name: "House Rent Allowance", componentType: "earning", calcType: "percent_of_basic", defaultValue: "40", displayOrder: 2 },
  { id: "da", code: "DA", name: "Dearness Allowance", componentType: "earning", calcType: "percent_of_basic", defaultValue: "20", isPfApplicable: true, displayOrder: 3 },
  { id: "ta", code: "TA", name: "Transport Allowance", componentType: "earning", calcType: "fixed", defaultValue: "1600", displayOrder: 4 },
  { id: "tds", code: "TDS", name: "TDS", componentType: "statutory_deduction", calcType: "fixed", displayOrder: 13 },
];

describe("Phase 8 payroll computation", () => {
  it("enables and forces RLS on every Phase 8 tenant table", async () => {
    const opsUrl = process.env.OPS_DATABASE_URL;
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    const ops = new Pool({ connectionString: opsUrl, max: 1 });
    try {
      const rls = await ops.query(
        "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
        [PHASE8_TABLES],
      );
      expect(rls.rows).toHaveLength(PHASE8_TABLES.length);
      for (const row of rls.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
        expect(row.policies).toBeGreaterThan(0);
      }
    } finally {
      await ops.end();
    }
  });

  it("computes gross, statutory deductions, and net in paise", () => {
    const result = computePayrollAmounts({
      settings: { standardWorkingDays: 26, pfEmployeeRate: "12", pfEmployerRate: "12", esiGrossCeilingPaise: 2100000, ptThresholdPaise: 1000000, ptMonthlyPaise: 20000 },
      components,
      assignments: [{ componentId: "basic", overrideValue: "25000" }],
    });
    expect(result.grossPaise).toBe(4160000);
    expect(result.pfEmployeePaise).toBe(360000);
    expect(result.esiEmployeePaise).toBe(0);
    expect(result.professionalTaxPaise).toBe(20000);
    expect(result.netPaise).toBe(3780000);
  });

  it("prorates earning components for absences", () => {
    const result = computePayrollAmounts({
      settings: { standardWorkingDays: 26, pfEmployeeRate: "12", pfEmployerRate: "12", esiGrossCeilingPaise: 2100000, ptThresholdPaise: 1000000, ptMonthlyPaise: 20000 },
      components,
      assignments: [{ componentId: "basic", overrideValue: "25000" }],
      daysAbsent: 2,
    });
    expect(result.grossPaise).toBe(3839999);
    expect(result.daysAbsent).toBe(2);
  });

  it("includes ESI below the gross ceiling and loan EMI deductions", () => {
    const result = computePayrollAmounts({
      settings: { standardWorkingDays: 26, pfEmployeeRate: "12", pfEmployerRate: "12", esiGrossCeilingPaise: 2100000, ptThresholdPaise: 1000000, ptMonthlyPaise: 20000 },
      components,
      assignments: [{ componentId: "basic", overrideValue: "9000" }],
      loans: [{ emiPaise: 50000, outstandingPaise: 120000 }],
    });
    expect(result.grossPaise).toBe(1600000);
    expect(result.esiEmployeePaise).toBe(12000);
    expect(result.loanEmiPaise).toBe(50000);
  });

  it("treats amountToWords input as paise", () => {
    expect(amountToWords(37363)).toBe("Three Hundred Seventy Three Rupees Sixty Three Paise Only");
    expect(amountToWords(3736300)).toBe("Thirty Seven Thousand Three Hundred Sixty Three Rupees Only");
  });
});
