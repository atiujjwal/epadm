This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# epadm
An intelligent solution for schools


step 1: clone the repo
step 2: run this command:
# Initialize Next.js 15 (App Router, TypeScript, Tailwind, ESLint)
"npx create-next-app@latest epadm --typescript --tailwind --eslint"
npx create-next-app@latest . --typescript --tailwind --eslint   // The . tells the installer: "Install everything right here in this current folder."


# Install Core Infrastructure Dependencies
# pg: PostgreSQL client
# drizzle-orm: (Recommended) For strict schema definition and RLS SQL generation
# zkteco-js: For the Node.js biometric service (to be separated later, but noted here)
npm install pg drizzle-orm dotenv server-only
npm install -D drizzle-kit @types/pg



#### finance frontend implementation:
"""
This is a comprehensive Frontend Integration Specification for the Finance Domain. It is designed to guide the frontend engineering team in consuming the APIs and implementing the UI/UX for School Financial Management.

📘 Finance Domain: Frontend Integration Report
Version: 1.0 Status: Ready for Implementation Scope: Fee Management (Inflows), Operational Expenses (Outflows), and General Ledger.

1. Architecture & Strategy
We will follow the project's established Service-Repository Pattern adapted for the frontend:

API Layer (src/services/api/finance.ts): Stateless functions that wrap fetch/axios calls. Strictly typed arguments and return values.

Data Layer (React Query/TanStack Query): Custom hooks (useLedger, useFeeStructures) to handle caching, loading states, and revalidation.

UI Layer:

Smart Containers: Handle logic and data fetching.

Dumb Components: Presentation-only (Tables, Forms, Charts).

2. Type Definitions (Contract)
Sync these types with the backend DTOs to ensure type safety across the network boundary.

File: src/types/finance.d.ts

TypeScript

// --- ENUMS ---
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod = "CASH" | "CHEQUE" | "ONLINE" | "BANK_TRANSFER" | "POS";
export type TransactionType = "CREDIT" | "DEBIT";

// --- ENTITIES ---

export interface FeeStructure {
  id: string;
  name: string;
  totalAmount: number;
  components: Array<{ headId: string; amount: number; dueDate?: string }>;
  isActive: boolean;
}

export interface FeeAllocation {
  id: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: PaymentStatus;
  dueDate: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType; // CREDIT | DEBIT
  description?: string;
  fieldSchema?: {
    fields: Array<{ key: string; label: string; type: "text" | "number" }>;
  };
}

export interface FinanceTransaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryName: string;
  entityName?: string;
  attributes?: Record<string, any>; // Custom fields (e.g., odometer)
}

// --- API PAYLOADS ---

export interface CreateTransactionPayload {
  categoryId: string;
  amount: number;
  transactionDate: string; // ISO Date
  title: string;
  description?: string;
  entityUserId?: string;
  entityName?: string;
  attributes?: Record<string, any>;
}

export interface CreatePaymentPayload {
  allocationId: string;
  amount: number;
  method: PaymentMethod;
  referenceId?: string; // Cheque No / Transaction ID
  paymentDate?: string;
}
3. Service Layer Implementation
Create a centralized file for all Finance API calls. This abstracts the fetch logic and headers.

File: src/services/financeService.ts

TypeScript

import { apiClient } from "@/lib/api"; // Assumed Axios/Fetch wrapper
import type { 
  FinanceCategory, 
  FinanceTransaction, 
  CreateTransactionPayload,
  CreatePaymentPayload 
} from "@/types/finance";

const BASE_URL = "/api/finance";

export const financeService = {
  // --- GENERAL LEDGER ---
  
  getLedger: async (filters?: { startDate?: string; endDate?: string; type?: string }) => {
    const params = new URLSearchParams(filters as Record<string, string>);
    const { data } = await apiClient.get<{ data: FinanceTransaction[] }>(
      `${BASE_URL}/ledger?${params.toString()}`
    );
    return data.data;
  },

  recordTransaction: async (payload: CreateTransactionPayload) => {
    const { data } = await apiClient.post(`${BASE_URL}/ledger`, payload);
    return data.data;
  },

  getCategories: async (type?: "CREDIT" | "DEBIT") => {
    const url = type ? `${BASE_URL}/categories?type=${type}` : `${BASE_URL}/categories`;
    const { data } = await apiClient.get<{ data: FinanceCategory[] }>(url);
    return data.data;
  },

  createCategory: async (payload: Partial<FinanceCategory>) => {
    const { data } = await apiClient.post(`${BASE_URL}/categories`, payload);
    return data.data;
  },

  // --- FEE MANAGEMENT ---

  collectPayment: async (payload: CreatePaymentPayload) => {
    const { data } = await apiClient.post(`${BASE_URL}/payments`, payload);
    return data.data;
  },
  
  // Fetch invoices for a specific student
  getStudentAllocations: async (studentId: string) => {
    const { data } = await apiClient.get(`${BASE_URL}/allocations?studentId=${studentId}`);
    return data.data;
  }
};
4. Feature Implementation Strategy
Module A: The General Ledger (Expenses & Income)
UI Component: LedgerTable.tsx

Features:

Date Range Picker (Start Date - End Date).

Filter Dropdown (Income vs. Expense).

DataTable with columns: Date, Title, Category, Amount (Color-coded: Green for Credit, Red for Debit).

UI Component: RecordTransactionModal.tsx

Logic:

User selects "Income" or "Expense".

Fetch getCategories(type) to populate the Category Dropdown.

Dynamic Forms: On category selection, check category.fieldSchema. If it exists, dynamically render inputs.

Example: Selecting "Fuel" renders an "Odometer Reading" number input.

Submit using recordTransaction.

Module B: Fee Collection Point
UI Component: StudentFeeProfile.tsx

Workflow:

Search Student by Name/Admission No.

Display "Outstanding Invoices" card.

Action: "Collect Fee" Button opens PaymentModal.

PaymentModal:

Shows Due Amount.

Input Paying Amount (Validate: paying <= due).

Select Method (Cash/Online/Cheque).

Submit via collectPayment.

Module C: Finance Dashboard
UI Component: FinanceStats.tsx

Visualization:

Cash Flow Chart: Line chart comparing Credits vs. Debits over time.

Expense Breakdown: Pie chart of Debits grouped by Category.

KPI Cards: "Total Collected Today", "Pending Fee Dues", "Monthly Expenses".

5. Recommended Hooks (React Query)
File: src/hooks/useFinance.ts

TypeScript

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";

export function useLedger(filters: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["finance-ledger", filters],
    queryFn: () => financeService.getLedger(filters),
  });
}

export function useCategories(type?: "CREDIT" | "DEBIT") {
  return useQuery({
    queryKey: ["finance-categories", type],
    queryFn: () => financeService.getCategories(type),
    staleTime: 1000 * 60 * 5, // Cache categories for 5 mins
  });
}

export function useRecordTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.recordTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-ledger"] });
      // Trigger Toast: "Transaction Recorded"
    },
  });
}
6. Implementation Checklist
[ ] Route Setup: Create app/(dashboard)/finance/ledger/page.tsx, app/(dashboard)/finance/fees/page.tsx.

[ ] Service Integration: Copy financeService.ts and types/finance.d.ts into the project.

[ ] Dynamic Form Builder: Implement a helper component that takes fieldSchema JSON and renders React Hook Form inputs.

[ ] Validation: Use Zod schemas for the forms.

Constraint: Date cannot be in the future (unless strictly allowed).

Constraint: Amount must be > 0.

[ ] Testing: Verify that recording a "Staff Salary" (Debit) correctly reduces the calculated cash-in-hand in the dashboard stats.
"""















