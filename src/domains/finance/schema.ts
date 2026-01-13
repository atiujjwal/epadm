import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  jsonb,
  boolean,
  index,
  pgEnum,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { tenants, users } from "../identity-tenancy/schema";
import { academicYears, classes, students } from "../academic-core/schema";

// --- ENUMS ---
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "CHEQUE",
  "ONLINE",
  "BANK_TRANSFER",
  "POS",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "CREDIT",
  "DEBIT",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
]);

/**
 * FEE HEADS
 * Categories of fees (e.g., "Tuition Fee", "Library Fee", "Transport").
 */
export const feeHeads = pgTable(
  "fee_heads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),

    // Ledger Configuration
    isRefundable: boolean("is_refundable").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantIdx: index("idx_fee_heads_tenant").on(table.tenantId),
  })
);

/**
 * FEE STRUCTURES
 * Defines the standard fee for a group (e.g., "Class 10 General Fee").
 */
export const feeStructures = pgTable(
  "fee_structures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    academicYearId: uuid("academic_year_id")
      .references(() => academicYears.id)
      .notNull(),

    // Optional targeting: If null, applies generally or manually assigned
    classId: uuid("class_id").references(() => classes.id),

    name: text("name").notNull(), // e.g., "Grade 10 - Term 1"

    // The components: Array of { headId: string, amount: number, dueDate: string }
    components: jsonb("components").notNull(),

    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantIdx: index("idx_fee_structures_tenant").on(
      table.tenantId,
      table.academicYearId
    ),
  })
);

/**
 * FEE ALLOCATIONS (INVOICES)
 * Specific demand raised against a student.
 */
export const feeAllocations = pgTable(
  "fee_allocations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),
    structureId: uuid("structure_id").references(() => feeStructures.id), // Can be null if ad-hoc

    // Financial State
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    paidAmount: numeric("paid_amount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    dueAmount: numeric("due_amount", { precision: 12, scale: 2 }).notNull(), // Denormalized for query speed

    dueDate: timestamp("due_date").notNull(),
    status: paymentStatusEnum("status").default("PENDING").notNull(),

    remarks: text("remarks"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantStudentIdx: index("idx_allocations_tenant_student").on(
      table.tenantId,
      table.studentId
    ),
    tenantStatusIdx: index("idx_allocations_tenant_status").on(
      table.tenantId,
      table.status
    ),
  })
);

/**
 * PAYMENTS (TRANSACTIONS)
 * Actual money collection records.
 */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    allocationId: uuid("allocation_id")
      .references(() => feeAllocations.id)
      .notNull(),
    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(), // Redundant but useful for payment logs

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentDate: timestamp("payment_date").defaultNow().notNull(),
    method: paymentMethodEnum("method").notNull(),

    // Audit
    collectedById: uuid("collected_by_id")
      .references(() => users.id)
      .notNull(),
    referenceId: text("reference_id"), // Cheque No, Transaction ID

    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Voided payments
  },
  (table) => ({
    tenantDateIdx: index("idx_payments_tenant_date").on(
      table.tenantId,
      table.paymentDate
    ),
    allocationIdx: index("idx_payments_allocation").on(table.allocationId),
  })
);

/**
 * FINANCE CATEGORIES (Chart of Accounts)
 * Defines the nature of income/expense.
 * e.g., "Staff Salary" (Debit), "Scrap Sales" (Credit), "Transport Fuel" (Debit)
 */
export const financeCategories = pgTable(
  "finance_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    name: text("name").notNull(), // "Diesel", "Teacher Salary"
    type: transactionTypeEnum("type").notNull(), // CREDIT (Income) or DEBIT (Expense)
    description: text("description"),

    // Parent Category for hierarchy (e.g., "Utilities" -> "Electricity")
    parentId: uuid("parent_id").references(
      (): AnyPgColumn => financeCategories.id
    ),

    // CUSTOM FIELD DEFINITIONS
    // Stores metadata about what extra fields are needed for this category.
    // e.g., { "fields": [{ "key": "odometer", "label": "Odometer", "type": "number" }] }
    fieldSchema: jsonb("field_schema").default({}),

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantIdx: index("idx_finance_categories_tenant").on(table.tenantId),
    parentIdx: index("idx_finance_categories_parent").on(table.parentId),
  })
);

/**
 * FINANCE TRANSACTIONS (General Ledger)
 * Records all non-fee financial movements.
 */
export const financeTransactions = pgTable(
  "finance_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    categoryId: uuid("category_id")
      .references(() => financeCategories.id)
      .notNull(),

    // Amount & Date
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    transactionDate: timestamp("transaction_date").defaultNow().notNull(),

    type: transactionTypeEnum("type").notNull(), // Redundant but useful for fast indexing
    status: transactionStatusEnum("status").default("COMPLETED").notNull(),

    // Payee/Payer Details
    title: text("title").notNull(), // "March Salary - John Doe"
    description: text("description"),

    // Link to System Users (if applicable, e.g., Teacher, Driver)
    entityUserId: uuid("entity_user_id").references(() => users.id),
    entityName: text("entity_name"), // "External Vendor Name" if not a system user

    // CUSTOM FIELDS STORAGE
    // e.g., { "odometer": 45000, "invoice_no": "INV-999" }
    attributes: jsonb("attributes").default({}),

    // Audit
    recordedById: uuid("recorded_by_id")
      .references(() => users.id)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantDateIdx: index("idx_fin_trans_tenant_date").on(
      table.tenantId,
      table.transactionDate
    ),
    categoryIdx: index("idx_fin_trans_category").on(table.categoryId),
    entityIdx: index("idx_fin_trans_entity").on(table.entityUserId),
  })
);
