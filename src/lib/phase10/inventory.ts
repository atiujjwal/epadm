import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  assetConditionHistory,
  assets,
  inventoryCategories,
  inventoryItems,
  inventoryStock,
  inventoryTransactions,
  purchaseRequisitionItems,
  purchaseRequisitions,
  vendors,
} from "@/lib/db";
import { withTenant, type TenantTransaction } from "@/lib/rls";
import { clean, decimal, decimalString, Phase10Error, writeAuditLog } from "./shared";

export function calculateCurrentValue(
  purchaseCostPaise: number,
  salvageValuePaise: number,
  usefulLifeYears: number,
  purchaseDate: Date,
  method: "straight_line" | "written_down_value",
  asOf: Date = new Date(),
): number {
  if (purchaseCostPaise <= 0 || usefulLifeYears <= 0) return 0;
  const elapsedMs = asOf.getTime() - purchaseDate.getTime();
  const yearsElapsed = Math.max(0, Math.floor(elapsedMs / (365.2425 * 24 * 60 * 60 * 1000)));
  if (method === "straight_line") {
    const annualDepreciation = (purchaseCostPaise - salvageValuePaise) / usefulLifeYears;
    const totalDepreciation = annualDepreciation * Math.min(yearsElapsed, usefulLifeYears);
    return Math.round(Math.max(salvageValuePaise, purchaseCostPaise - totalDepreciation));
  }
  if (salvageValuePaise <= 0) {
    const rate = 1 / usefulLifeYears;
    return Math.round(Math.max(0, purchaseCostPaise * Math.pow(1 - rate, yearsElapsed)));
  }
  const rate = 1 - Math.pow(salvageValuePaise / purchaseCostPaise, 1 / usefulLifeYears);
  return Math.round(Math.max(salvageValuePaise, purchaseCostPaise * Math.pow(1 - rate, yearsElapsed)));
}

export function stockStatus(quantity: string | number, reorderLevel: string | number) {
  const qty = decimal(quantity);
  const reorder = decimal(reorderLevel);
  if (qty <= 0) return "out";
  if (qty <= reorder) return "low";
  return "ok";
}

export async function listInventoryModel(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [categories, items, stock, transactions, requisitions, reqItems, assetRows, vendorRows] = await Promise.all([
      tx.select().from(inventoryCategories).where(eq(inventoryCategories.tenantId, tenantId)).orderBy(asc(inventoryCategories.displayOrder), asc(inventoryCategories.name)),
      tx.select().from(inventoryItems).where(eq(inventoryItems.tenantId, tenantId)).orderBy(asc(inventoryItems.name)),
      tx.select().from(inventoryStock).where(eq(inventoryStock.tenantId, tenantId)).orderBy(asc(inventoryStock.location)),
      tx.select().from(inventoryTransactions).where(eq(inventoryTransactions.tenantId, tenantId)).orderBy(desc(inventoryTransactions.createdAt)).limit(100),
      tx.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.tenantId, tenantId)).orderBy(desc(purchaseRequisitions.createdAt)),
      tx.select().from(purchaseRequisitionItems).where(eq(purchaseRequisitionItems.tenantId, tenantId)),
      tx.select().from(assets).where(eq(assets.tenantId, tenantId)).orderBy(asc(assets.assetCode)),
      tx.select().from(vendors).where(eq(vendors.tenantId, tenantId)).orderBy(asc(vendors.name)),
    ]);
    const stockByItem = new Map<string, number>();
    for (const row of stock) stockByItem.set(row.itemId, (stockByItem.get(row.itemId) ?? 0) + decimal(row.quantity));
    return {
      categories,
      items: items.map((item) => ({
        ...item,
        totalStock: decimalString(stockByItem.get(item.id) ?? 0),
        stockStatus: stockStatus(stockByItem.get(item.id) ?? 0, item.reorderLevel),
      })),
      stock,
      transactions,
      requisitions,
      requisitionItems: reqItems,
      assets: assetRows.map((asset) => ({
        ...asset,
        currentValuePaise: calculateCurrentValue(asset.purchaseCostPaise, asset.salvageValuePaise, asset.usefulLifeYears, new Date(asset.purchaseDate), asset.depreciationMethod as "straight_line" | "written_down_value"),
      })),
      vendors: vendorRows,
    };
  });
}

export async function ensureInventoryDefaults(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const defaults = [
      { name: "Stationery", itemType: "consumable", displayOrder: 10 },
      { name: "Cleaning", itemType: "consumable", displayOrder: 20 },
      { name: "IT Equipment", itemType: "asset", displayOrder: 30 },
      { name: "Furniture", itemType: "asset", displayOrder: 40 },
    ];
    return tx.insert(inventoryCategories).values(defaults.map((row) => ({ ...row, tenantId })))
      .onConflictDoNothing()
      .returning();
  });
}

export async function createInventoryCategory(tenantId: string, input: { name: string; itemType?: string; description?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [category] = await tx.insert(inventoryCategories).values({
      tenantId,
      name: input.name.trim(),
      itemType: input.itemType ?? "consumable",
      description: clean(input.description),
    }).onConflictDoUpdate({
      target: [inventoryCategories.tenantId, inventoryCategories.name],
      set: { itemType: input.itemType ?? "consumable", description: clean(input.description) },
    }).returning();
    return category;
  });
}

export async function createInventoryItem(tenantId: string, actorUserId: string, input: {
  categoryId: string;
  name: string;
  itemCode?: string | null;
  unit?: string | null;
  minimumStock?: string | number;
  reorderLevel?: string | number;
  unitCostPaise?: number;
}) {
  return withTenant(tenantId, async (tx) => {
    const [item] = await tx.insert(inventoryItems).values({
      tenantId,
      categoryId: input.categoryId,
      name: input.name.trim(),
      itemCode: clean(input.itemCode),
      unit: clean(input.unit) ?? "piece",
      minimumStock: decimalString(input.minimumStock ?? 0),
      reorderLevel: decimalString(input.reorderLevel ?? 0),
      unitCostPaise: input.unitCostPaise ?? 0,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "inventory.item.created", entityType: "inventory_item", entityId: item.id });
    return item;
  });
}

async function applyStockDelta(tx: TenantTransaction, tenantId: string, itemId: string, location: string, delta: number) {
  const [existing] = await tx.select().from(inventoryStock).where(and(
    eq(inventoryStock.tenantId, tenantId),
    eq(inventoryStock.itemId, itemId),
    eq(inventoryStock.location, location),
  )).limit(1);
  const current = decimal(existing?.quantity);
  const next = current + delta;
  if (next < -0.000001) throw new Phase10Error(`Insufficient stock (available: ${current}).`, 422);
  if (existing) {
    const [updated] = await tx.update(inventoryStock).set({ quantity: decimalString(next), lastUpdated: new Date() })
      .where(and(eq(inventoryStock.tenantId, tenantId), eq(inventoryStock.id, existing.id))).returning();
    return updated;
  }
  const [created] = await tx.insert(inventoryStock).values({
    tenantId,
    itemId,
    location,
    quantity: decimalString(next),
  }).returning();
  return created;
}

export async function recordInventoryTransaction(tenantId: string, actorUserId: string, input: {
  itemId: string;
  transactionType: "receipt" | "issue" | "transfer" | "adjustment" | "return" | "loss";
  quantity: string | number;
  location?: string | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  unitCostPaise?: number | null;
  reference?: string | null;
  departmentId?: string | null;
  vendorId?: string | null;
  issuedTo?: string | null;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const qty = decimal(input.quantity);
    if (qty <= 0 && input.transactionType !== "adjustment") throw new Phase10Error("Quantity must be greater than zero.", 422);
    const fromLocation = clean(input.fromLocation) ?? clean(input.location) ?? "main_store";
    const toLocation = clean(input.toLocation) ?? clean(input.location) ?? "main_store";
    const stockRows = [];
    if (input.transactionType === "receipt" || input.transactionType === "return") {
      stockRows.push(await applyStockDelta(tx, tenantId, input.itemId, toLocation, qty));
    } else if (input.transactionType === "issue" || input.transactionType === "loss") {
      stockRows.push(await applyStockDelta(tx, tenantId, input.itemId, fromLocation, -qty));
    } else if (input.transactionType === "transfer") {
      if (fromLocation === toLocation) throw new Phase10Error("Transfer requires different source and destination locations.", 422);
      stockRows.push(await applyStockDelta(tx, tenantId, input.itemId, fromLocation, -qty));
      stockRows.push(await applyStockDelta(tx, tenantId, input.itemId, toLocation, qty));
    } else {
      stockRows.push(await applyStockDelta(tx, tenantId, input.itemId, toLocation, qty));
    }
    const signedQuantity = input.transactionType === "issue" || input.transactionType === "loss" ? -Math.abs(qty) : qty;
    const unitCost = input.unitCostPaise ?? null;
    const [transaction] = await tx.insert(inventoryTransactions).values({
      tenantId,
      itemId: input.itemId,
      transactionType: input.transactionType,
      quantity: decimalString(signedQuantity),
      unitCostPaise: unitCost,
      totalCostPaise: unitCost == null ? null : Math.round(unitCost * Math.abs(qty)),
      fromLocation: input.transactionType === "receipt" || input.transactionType === "return" ? null : fromLocation,
      toLocation: input.transactionType === "issue" || input.transactionType === "loss" ? null : toLocation,
      reference: clean(input.reference),
      departmentId: input.departmentId ?? null,
      vendorId: input.vendorId ?? null,
      issuedTo: input.issuedTo ?? null,
      notes: clean(input.notes),
      createdBy: actorUserId,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: `inventory.transaction.${input.transactionType}`, entityType: "inventory_transaction", entityId: transaction.id });
    return { transaction, stock: stockRows };
  });
}

export async function createPurchaseRequisition(tenantId: string, actorUserId: string, input: {
  departmentId?: string | null;
  requiredByDate?: string | null;
  priority?: string | null;
  notes?: string | null;
  items: Array<{ itemId: string; quantity: string | number; estUnitCostPaise?: number | null; notes?: string | null }>;
}) {
  return withTenant(tenantId, async (tx) => {
    const [{ value }] = await tx.select({ value: sql<number>`count(*)::int` }).from(purchaseRequisitions).where(eq(purchaseRequisitions.tenantId, tenantId));
    const number = `REQ-${new Date().getFullYear()}-${String((value ?? 0) + 1).padStart(5, "0")}`;
    const [req] = await tx.insert(purchaseRequisitions).values({
      tenantId,
      requisitionNumber: number,
      requestedBy: actorUserId,
      departmentId: input.departmentId ?? null,
      requiredByDate: input.requiredByDate ?? null,
      priority: clean(input.priority) ?? "normal",
      notes: clean(input.notes),
    }).returning();
    if (input.items.length) {
      await tx.insert(purchaseRequisitionItems).values(input.items.map((item) => ({
        tenantId,
        requisitionId: req.id,
        itemId: item.itemId,
        quantity: decimalString(item.quantity),
        estUnitCostPaise: item.estUnitCostPaise ?? null,
        notes: clean(item.notes),
      })));
    }
    await writeAuditLog(tx, { tenantId, actorUserId, action: "inventory.requisition.created", entityType: "purchase_requisition", entityId: req.id });
    return req;
  });
}

export async function approvePurchaseRequisition(tenantId: string, actorUserId: string, requisitionId: string) {
  return withTenant(tenantId, async (tx) => {
    const [req] = await tx.select().from(purchaseRequisitions).where(and(eq(purchaseRequisitions.tenantId, tenantId), eq(purchaseRequisitions.id, requisitionId))).limit(1);
    if (!req) throw new Phase10Error("Purchase requisition not found.", 404);
    const items = await tx.select().from(purchaseRequisitionItems).where(and(eq(purchaseRequisitionItems.tenantId, tenantId), eq(purchaseRequisitionItems.requisitionId, requisitionId)));
    const warnings: string[] = [];
    for (const item of items) {
      try {
        await applyStockDelta(tx, tenantId, item.itemId, "main_store", -decimal(item.quantity));
        await tx.insert(inventoryTransactions).values({
          tenantId,
          itemId: item.itemId,
          transactionType: "issue",
          quantity: decimalString(-decimal(item.quantity)),
          fromLocation: "main_store",
          reference: req.requisitionNumber,
          departmentId: req.departmentId,
          createdBy: actorUserId,
        });
      } catch (error) {
        if (error instanceof Phase10Error) warnings.push(`${item.itemId}: ${error.message}`);
        else throw error;
      }
    }
    const [updated] = await tx.update(purchaseRequisitions).set({ status: "approved", approvedBy: actorUserId, approvedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(purchaseRequisitions.tenantId, tenantId), eq(purchaseRequisitions.id, requisitionId))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "inventory.requisition.approved", entityType: "purchase_requisition", entityId: requisitionId, metadata: { warnings } });
    return { requisition: updated, warnings };
  });
}

export async function createVendor(tenantId: string, actorUserId: string, input: typeof vendors.$inferInsert) {
  return withTenant(tenantId, async (tx) => {
    const [vendor] = await tx.insert(vendors).values({ ...input, tenantId }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "inventory.vendor.created", entityType: "vendor", entityId: vendor.id });
    return vendor;
  });
}

export async function createAsset(tenantId: string, actorUserId: string, input: Omit<typeof assets.$inferInsert, "id" | "tenantId" | "createdAt" | "updatedAt" | "currentValuePaise">) {
  return withTenant(tenantId, async (tx) => {
    const currentValuePaise = calculateCurrentValue(
      input.purchaseCostPaise ?? 0,
      input.salvageValuePaise ?? 0,
      input.usefulLifeYears ?? 5,
      new Date(input.purchaseDate),
      (input.depreciationMethod ?? "straight_line") as "straight_line" | "written_down_value",
    );
    const [asset] = await tx.insert(assets).values({ ...input, tenantId, currentValuePaise }).returning();
    await tx.insert(assetConditionHistory).values({
      tenantId,
      assetId: asset.id,
      condition: asset.condition,
      recordedBy: actorUserId,
      notes: "Initial asset condition",
    });
    await writeAuditLog(tx, { tenantId, actorUserId, action: "inventory.asset.created", entityType: "asset", entityId: asset.id });
    return asset;
  });
}
