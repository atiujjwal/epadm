import { InferSelectModel } from "drizzle-orm";
import {
  feeHeads,
  feeStructures,
  feeAllocations,
  payments,
  financeCategories,
  financeTransactions,
} from "./schema";

// --- ENTITIES ---
export type FeeHead = InferSelectModel<typeof feeHeads>;
export type FeeStructure = InferSelectModel<typeof feeStructures>;
export type FeeAllocation = InferSelectModel<typeof feeAllocations>;
export type Payment = InferSelectModel<typeof payments>;
export type FinanceCategory = InferSelectModel<typeof financeCategories>;
export type FinanceTransaction = InferSelectModel<typeof financeTransactions>;

export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "CANCELLED";

// --- ENUMS ---
export type PaymentStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethod =
  | "CASH"
  | "CHEQUE"
  | "ONLINE"
  | "BANK_TRANSFER"
  | "POS";

// --- INPUTS ---

export interface CreateFeeHeadInput {
  name: string;
  description?: string;
  isRefundable?: boolean;
}

export interface FeeComponentInput {
  headId: string;
  amount: number;
  dueDate?: string; // Optional override
}

export interface CreateFeeStructureInput {
  name: string;
  academicYearId: string;
  classId?: string;
  components: FeeComponentInput[];
  // Total is calculated by backend for safety, or validated if sent
}

export interface CreateAllocationInput {
  studentId: string;
  structureId: string;
  dueDate: string; // ISO Date
  overrideAmount?: number; // Authorization required
  remarks?: string;
}

export interface CreatePaymentInput {
  allocationId: string;
  amount: number;
  method: PaymentMethod;
  referenceId?: string;
  paymentDate?: string; // Backdating allowed with permission
}

// --- FILTERS ---

export interface AllocationFilters {
  studentId?: string;
  status?: PaymentStatus;
  classId?: string;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  description?: string;
  parentId?: string;
  // Define custom fields needed for this category
  fieldSchema?: {
    fields: Array<{
      key: string;
      label: string;
      type: "text" | "number" | "date" | "boolean";
      required?: boolean;
    }>;
  };
}

export interface CreateTransactionInput {
  categoryId: string;
  amount: number;
  transactionDate: string | Date;
  title: string;
  description?: string;

  // Who is this for?
  entityUserId?: string; // e.g., Teacher ID
  entityName?: string; // e.g., "ABC Stationery Suppliers"

  // Custom values matching the category schema
  attributes?: Record<string, any>;
}

// --- FILTERS ---

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
  entityUserId?: string;
}
