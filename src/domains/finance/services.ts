import { PoolClient } from "pg";
import { eq, and, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  feeHeads,
  feeStructures,
  feeAllocations,
  payments,
  financeCategories,
  financeTransactions,
} from "./schema";
import {
  CreateFeeHeadInput,
  CreateFeeStructureInput,
  CreateAllocationInput,
  CreatePaymentInput,
  PaymentStatus,
  CreateCategoryInput,
  CreateTransactionInput,
  TransactionFilters,
} from "./types";
import { requirePermission } from "@/lib/auth/rbac";

// ==========================================
// FEE HEADS & STRUCTURES
// ==========================================

export async function createFeeHead(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateFeeHeadInput
) {
  await requirePermission(client, userId, "finance.config.write");
  const db = drizzle(client);

  const [record] = await db
    .insert(feeHeads)
    .values({
      tenantId,
      name: data.name,
      description: data.description,
      isRefundable: data.isRefundable || false,
    })
    .returning();
  return record;
}

export async function createFeeStructure(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateFeeStructureInput
) {
  await requirePermission(client, userId, "finance.config.write");
  const db = drizzle(client);

  // 1. Calculate Total safely on server
  const calculatedTotal = data.components.reduce((sum, c) => sum + c.amount, 0);

  const [record] = await db
    .insert(feeStructures)
    .values({
      tenantId,
      name: data.name,
      academicYearId: data.academicYearId,
      classId: data.classId,
      components: data.components,
      totalAmount: calculatedTotal.toString(),
    })
    .returning();
  return record;
}

export async function getFeeStructures(
  client: PoolClient,
  tenantId: string,
  userId: string,
  academicYearId?: string
) {
  await requirePermission(client, userId, "finance.read");
  const db = drizzle(client);

  const conditions = [
    eq(feeStructures.tenantId, tenantId),
    isNull(feeStructures.deletedAt),
  ];

  if (academicYearId) {
    conditions.push(eq(feeStructures.academicYearId, academicYearId));
  }

  return await db
    .select()
    .from(feeStructures)
    .where(and(...conditions));
}

// ==========================================
// ALLOCATIONS (INVOICING)
// ==========================================

export async function createAllocation(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateAllocationInput
) {
  await requirePermission(client, userId, "finance.invoice.write");
  const db = drizzle(client);

  // return await db
  //   .select()
  //   .from(feeStructures)
  //   .where(and(...conditions));

  // Fetch Structure to get amount (if not overridden)
  const structure = await db.query.feeStructures.findFirst({
    where: and(
      eq(feeStructures.id, data.structureId),
      eq(feeStructures.tenantId, tenantId)
    ),
  });

  if (!structure) throw new Error("Invalid Fee Structure");

  const amount = data.overrideAmount ?? parseFloat(structure.totalAmount);

  // Create Invoice
  const [invoice] = await db
    .insert(feeAllocations)
    .values({
      tenantId,
      studentId: data.studentId,
      structureId: data.structureId,
      totalAmount: amount.toString(),
      dueAmount: amount.toString(), // Initially due = total
      paidAmount: "0",
      dueDate: new Date(data.dueDate),
      status: "PENDING",
      remarks: data.remarks,
    })
    .returning();

  return invoice;
}

export async function getStudentAllocations(
  client: PoolClient,
  tenantId: string,
  userId: string,
  studentId: string
) {
  await requirePermission(client, userId, "finance.read"); // Or student.self.read
  const db = drizzle(client);

  return await db
    .select()
    .from(feeAllocations)
    .where(
      and(
        eq(feeAllocations.tenantId, tenantId),
        eq(feeAllocations.studentId, studentId),
        isNull(feeAllocations.deletedAt)
      )
    );
}

// ==========================================
// PAYMENTS (COLLECTION)
// ==========================================

export async function recordPayment(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreatePaymentInput
) {
  await requirePermission(client, userId, "finance.payment.write");
  const db = drizzle(client);

  // Transaction is implicitly handled by the shared `client` passed from the route
  // If we wanted explicit rollback here, we'd wrap in `db.transaction`,
  // but usually the Route handler wraps the whole request.

  // 1. Get Allocation
  const [allocation] = await db
    .select()
    .from(feeAllocations)
    .where(
      and(
        eq(feeAllocations.id, data.allocationId),
        eq(feeAllocations.tenantId, tenantId)
      )
    );

  if (!allocation) throw new Error("Invoice not found");

  const currentPaid = parseFloat(allocation.paidAmount);
  const total = parseFloat(allocation.totalAmount);
  const newPayment = data.amount;

  if (currentPaid + newPayment > total) {
    throw new Error("Payment exceeds due amount");
  }

  // 2. Record Payment
  const [payment] = await db
    .insert(payments)
    .values({
      tenantId,
      allocationId: data.allocationId,
      studentId: allocation.studentId,
      amount: newPayment.toString(),
      method: data.method,
      referenceId: data.referenceId,
      collectedById: userId,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
    })
    .returning();

  // 3. Update Allocation Status
  const updatedPaid = currentPaid + newPayment;
  const updatedDue = total - updatedPaid;

  let newStatus: PaymentStatus = "PARTIAL";
  if (updatedDue <= 0) newStatus = "PAID";

  await db
    .update(feeAllocations)
    .set({
      paidAmount: updatedPaid.toString(),
      dueAmount: updatedDue.toString(),
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(feeAllocations.id, allocation.id));

  return { payment, newStatus };
}

// ==========================================
// FINANCE CONFIG (Chart of Accounts)
// ==========================================

export async function createFinanceCategory(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateCategoryInput
) {
  await requirePermission(client, userId, "finance.config.write");
  const db = drizzle(client);

  const [category] = await db
    .insert(financeCategories)
    .values({
      tenantId,
      name: data.name,
      type: data.type,
      description: data.description,
      parentId: data.parentId,
      fieldSchema: data.fieldSchema || {},
    })
    .returning();
  return category;
}

export async function getFinanceCategories(
  client: PoolClient,
  tenantId: string,
  userId: string,
  type?: "CREDIT" | "DEBIT"
) {
  await requirePermission(client, userId, "finance.read");
  const db = drizzle(client);

  const conditions = [
    eq(financeCategories.tenantId, tenantId),
    isNull(financeCategories.deletedAt),
  ];

  if (type) {
    conditions.push(eq(financeCategories.type, type));
  }

  return await db
    .select()
    .from(financeCategories)
    .where(and(...conditions));
}

// ==========================================
// GENERAL LEDGER (Expenses & Other Income)
// ==========================================

export async function recordTransaction(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateTransactionInput
) {
  await requirePermission(client, userId, "finance.ledger.write");
  const db = drizzle(client);

  // 1. Validate Category
  const category = await db.query.financeCategories.findFirst({
    where: and(
      eq(financeCategories.id, data.categoryId),
      eq(financeCategories.tenantId, tenantId)
    ),
  });

  if (!category) throw new Error("Invalid Finance Category");

  // TODO: (Optional) Validate Attributes against fieldSchema here
  // This ensures "Odometer" is provided if the category requires it.

  // Record Transaction
  const [transaction] = await db
    .insert(financeTransactions)
    .values({
      tenantId,
      categoryId: data.categoryId,
      type: category.type, // Inherit type from category
      amount: data.amount.toString(),
      transactionDate: new Date(data.transactionDate),
      title: data.title,
      description: data.description,
      entityUserId: data.entityUserId,
      entityName: data.entityName,
      attributes: data.attributes || {},
      recordedById: userId,
      status: "COMPLETED",
    })
    .returning();

  return transaction;
}

export async function getTransactions(
  client: PoolClient,
  tenantId: string,
  userId: string,
  filters: TransactionFilters
) {
  await requirePermission(client, userId, "finance.read");
  const db = drizzle(client);

  const conditions = [
    eq(financeTransactions.tenantId, tenantId),
    isNull(financeTransactions.deletedAt),
  ];

  if (filters.categoryId)
    conditions.push(eq(financeTransactions.categoryId, filters.categoryId));
  if (filters.type) conditions.push(eq(financeTransactions.type, filters.type));
  if (filters.entityUserId)
    conditions.push(eq(financeTransactions.entityUserId, filters.entityUserId));

  if (filters.startDate && filters.endDate) {
    conditions.push(
      sql`${financeTransactions.transactionDate} BETWEEN ${new Date(
        filters.startDate
      )} AND ${new Date(filters.endDate)}`
    );
  }

  return await db
    .select({
      id: financeTransactions.id,
      date: financeTransactions.transactionDate,
      title: financeTransactions.title,
      amount: financeTransactions.amount,
      type: financeTransactions.type,
      category: financeCategories.name,
      entityName: financeTransactions.entityName,
      attributes: financeTransactions.attributes,
    })
    .from(financeTransactions)
    .leftJoin(
      financeCategories,
      eq(financeTransactions.categoryId, financeCategories.id)
    )
    .where(and(...conditions))
    .orderBy(sql`${financeTransactions.transactionDate} DESC`);
}
