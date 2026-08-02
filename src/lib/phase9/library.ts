import "server-only";

import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  auditLogs,
  libraryAcquisitionItems,
  libraryAcquisitions,
  libraryBooks,
  libraryCopies,
  libraryFines,
  libraryIssues,
  libraryMembers,
  librarySettings,
  libraryTitles,
  staffProfiles,
  students,
} from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";
import { Phase9Error } from "./transport";

async function writeAuditLog(tx: TenantTransaction, input: { tenantId: string; actorUserId?: string | null; action: string; entityType: string; entityId: string; metadata?: Record<string, unknown> }) {
  await tx.insert(auditLogs).values({
    tenantId: input.tenantId,
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
  });
}

export function calculateLibraryFine(input: { dueDate: string | Date; returnedAt?: string | Date; finePerDayPaise: number }) {
  const due = new Date(`${String(input.dueDate).slice(0, 10)}T00:00:00Z`);
  const returned = input.returnedAt ? new Date(`${String(input.returnedAt).slice(0, 10)}T00:00:00Z`) : new Date();
  const days = Math.max(Math.floor((returned.getTime() - due.getTime()) / 86400000), 0);
  return { daysOverdue: days, finePaise: days * input.finePerDayPaise };
}

export async function ensureLibrarySettings(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [settings] = await tx.insert(librarySettings).values({ tenantId }).onConflictDoNothing({ target: librarySettings.tenantId }).returning();
    if (settings) return settings;
    const [existing] = await tx.select().from(librarySettings).where(eq(librarySettings.tenantId, tenantId)).limit(1);
    return existing;
  });
}

export async function listLibraryModel(tenantId: string, search?: string) {
  await ensureLibrarySettings(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [settings] = await tx.select().from(librarySettings).where(eq(librarySettings.tenantId, tenantId)).limit(1);
    const [titles, copies, members, issues, fines, acquisitions, items] = await Promise.all([
      tx.select({
        id: libraryTitles.id,
        title: libraryTitles.title,
        author: libraryTitles.author,
        isbn: libraryTitles.isbn,
        subject: libraryTitles.subject,
        status: libraryTitles.status,
        copies: sql<number>`count(${libraryCopies.id})::int`,
        available: sql<number>`count(${libraryCopies.id}) filter (where ${libraryCopies.status} = 'available')::int`,
      }).from(libraryTitles)
        .leftJoin(libraryCopies, eq(libraryCopies.titleId, libraryTitles.id))
        .where(and(
          eq(libraryTitles.tenantId, tenantId),
          search ? or(ilike(libraryTitles.title, `%${search}%`), ilike(libraryTitles.author, `%${search}%`), ilike(libraryTitles.isbn, `%${search}%`)) : undefined,
        ))
        .groupBy(libraryTitles.id)
        .orderBy(asc(libraryTitles.title)),
      tx.select({
        id: libraryCopies.id,
        titleId: libraryCopies.titleId,
        accession: libraryCopies.accession,
        barcode: libraryCopies.barcode,
        status: libraryCopies.status,
        condition: libraryCopies.condition,
        title: libraryTitles.title,
        author: libraryTitles.author,
      }).from(libraryCopies)
        .innerJoin(libraryTitles, eq(libraryTitles.id, libraryCopies.titleId))
        .where(eq(libraryCopies.tenantId, tenantId))
        .orderBy(asc(libraryCopies.accession)),
      tx.select().from(libraryMembers).where(eq(libraryMembers.tenantId, tenantId)).orderBy(asc(libraryMembers.displayName)),
      tx.select({
        id: libraryIssues.id,
        copyId: libraryIssues.copyId,
        memberId: libraryIssues.memberId,
        issuedAt: libraryIssues.issuedAt,
        dueDate: libraryIssues.dueDate,
        returnedAt: libraryIssues.returnedAt,
        status: libraryIssues.status,
        finePaise: libraryIssues.finePaise,
        accession: libraryCopies.accession,
        title: libraryTitles.title,
        memberName: libraryMembers.displayName,
      }).from(libraryIssues)
        .innerJoin(libraryCopies, eq(libraryCopies.id, libraryIssues.copyId))
        .innerJoin(libraryTitles, eq(libraryTitles.id, libraryCopies.titleId))
        .innerJoin(libraryMembers, eq(libraryMembers.id, libraryIssues.memberId))
        .where(eq(libraryIssues.tenantId, tenantId))
        .orderBy(desc(libraryIssues.issuedAt)),
      tx.select().from(libraryFines).where(eq(libraryFines.tenantId, tenantId)).orderBy(desc(libraryFines.createdAt)),
      tx.select().from(libraryAcquisitions).where(eq(libraryAcquisitions.tenantId, tenantId)).orderBy(desc(libraryAcquisitions.createdAt)),
      tx.select().from(libraryAcquisitionItems).where(eq(libraryAcquisitionItems.tenantId, tenantId)).orderBy(desc(libraryAcquisitionItems.createdAt)),
    ]);
    return { settings, titles, copies, members, issues, fines, acquisitions, acquisitionItems: items };
  });
}

async function upsertTitle(tx: TenantTransaction, tenantId: string, input: { title: string; author?: string | null; isbn?: string | null; publisher?: string | null; subject?: string | null }) {
  const isbn = input.isbn?.trim() || null;
  if (isbn) {
    const [title] = await tx.insert(libraryTitles).values({
      tenantId,
      title: input.title.trim(),
      author: input.author?.trim() || null,
      isbn,
      publisher: input.publisher?.trim() || null,
      subject: input.subject?.trim() || null,
    }).onConflictDoUpdate({
      target: [libraryTitles.tenantId, libraryTitles.isbn],
      set: {
        title: input.title.trim(),
        author: input.author?.trim() || null,
        publisher: input.publisher?.trim() || null,
        subject: input.subject?.trim() || null,
        updatedAt: new Date(),
      },
    }).returning();
    return title;
  }
  const [title] = await tx.insert(libraryTitles).values({
    tenantId,
    title: input.title.trim(),
    author: input.author?.trim() || null,
    publisher: input.publisher?.trim() || null,
    subject: input.subject?.trim() || null,
  }).returning();
  return title;
}

export async function addLibraryTitle(tenantId: string, actorUserId: string, input: { title: string; author?: string | null; isbn?: string | null; publisher?: string | null; subject?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const title = await upsertTitle(tx, tenantId, input);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "library.title.saved", entityType: "library_title", entityId: title.id });
    return title;
  });
}

async function nextAccession(tx: TenantTransaction, tenantId: string) {
  const [row] = await tx.select({ value: count() }).from(libraryCopies).where(eq(libraryCopies.tenantId, tenantId));
  return `BK-${String((row?.value ?? 0) + 1).padStart(5, "0")}`;
}

export async function addLibraryCopy(tenantId: string, actorUserId: string, input: {
  titleId?: string | null;
  title?: string;
  author?: string | null;
  isbn?: string | null;
  accession?: string | null;
  barcode?: string | null;
  location?: string | null;
  shelf?: string | null;
  purchasePricePaise?: number;
}) {
  return withTenant(tenantId, async (tx) => {
    const title = input.titleId
      ? (await tx.select().from(libraryTitles).where(and(eq(libraryTitles.tenantId, tenantId), eq(libraryTitles.id, input.titleId))).limit(1))[0]
      : await upsertTitle(tx, tenantId, { title: input.title ?? "Untitled", author: input.author, isbn: input.isbn });
    if (!title) throw new Phase9Error("Library title not found.", 404);
    const accession = input.accession?.trim().toUpperCase() || await nextAccession(tx, tenantId);
    const [copy] = await tx.insert(libraryCopies).values({
      tenantId,
      titleId: title.id,
      accession,
      barcode: input.barcode?.trim() || accession,
      location: input.location?.trim() || null,
      shelf: input.shelf?.trim() || null,
      purchasePricePaise: input.purchasePricePaise ?? 0,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "library.copy.created", entityType: "library_copy", entityId: copy.id, metadata: { titleId: title.id } });
    return copy;
  });
}

export async function enrollLibraryMember(tenantId: string, input: {
  memberCode: string;
  memberType: "student" | "staff" | string;
  studentId?: string | null;
  staffId?: string | null;
  userId?: string | null;
  displayName?: string | null;
}) {
  await ensureLibrarySettings(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [settings] = await tx.select().from(librarySettings).where(eq(librarySettings.tenantId, tenantId)).limit(1);
    let displayName = input.displayName?.trim() || "";
    if (!displayName && input.studentId) {
      const [student] = await tx.select({ name: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))` }).from(students).where(and(eq(students.tenantId, tenantId), eq(students.id, input.studentId))).limit(1);
      displayName = student?.name ?? "";
    }
    if (!displayName && input.staffId) {
      const [staff] = await tx.select({ name: staffProfiles.fullName }).from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, input.staffId))).limit(1);
      displayName = staff?.name ?? "";
    }
    if (!displayName) throw new Phase9Error("Member display name is required.", 422);
    const [member] = await tx.insert(libraryMembers).values({
      tenantId,
      memberCode: input.memberCode.trim().toUpperCase(),
      memberType: input.memberType,
      studentId: input.studentId ?? null,
      staffId: input.staffId ?? null,
      userId: input.userId ?? null,
      displayName,
      maxActiveIssues: input.memberType === "staff" ? settings.staffMaxIssues : settings.studentMaxIssues,
    }).onConflictDoUpdate({
      target: [libraryMembers.tenantId, libraryMembers.memberCode],
      set: { displayName, status: "active", updatedAt: new Date() },
    }).returning();
    return member;
  });
}

export async function issueLibraryCopy(tenantId: string, actorUserId: string, input: { copyId: string; memberId: string; dueDate?: string | null }) {
  await ensureLibrarySettings(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [settings] = await tx.select().from(librarySettings).where(eq(librarySettings.tenantId, tenantId)).limit(1);
    const [copy] = await tx.select().from(libraryCopies).where(and(eq(libraryCopies.tenantId, tenantId), eq(libraryCopies.id, input.copyId))).limit(1);
    if (!copy) throw new Phase9Error("Library copy not found.", 404);
    if (copy.status !== "available") throw new Phase9Error("Library copy is not available for issue.", 409);
    const [member] = await tx.select().from(libraryMembers).where(and(eq(libraryMembers.tenantId, tenantId), eq(libraryMembers.id, input.memberId))).limit(1);
    if (!member) throw new Phase9Error("Library member not found.", 404);
    if (member.status !== "active") throw new Phase9Error(member.blockedReason ?? "Library member is blocked.", 409);
    const [active] = await tx.select({ value: count() }).from(libraryIssues).where(and(eq(libraryIssues.tenantId, tenantId), eq(libraryIssues.memberId, input.memberId), or(eq(libraryIssues.status, "issued"), eq(libraryIssues.status, "overdue"))));
    if ((active?.value ?? 0) >= member.maxActiveIssues) throw new Phase9Error("Library member has reached the active issue limit.", 422);
    const dueDate = input.dueDate ?? new Date(Date.now() + settings.defaultLoanDays * 86400000).toISOString().slice(0, 10);
    const [issue] = await tx.insert(libraryIssues).values({ tenantId, copyId: input.copyId, memberId: input.memberId, dueDate, issuedBy: actorUserId }).returning();
    await tx.update(libraryCopies).set({ status: "issued", updatedAt: new Date() }).where(and(eq(libraryCopies.tenantId, tenantId), eq(libraryCopies.id, input.copyId)));
    if (copy.legacyBookId) await tx.update(libraryBooks).set({ status: "issued", updatedAt: new Date() }).where(and(eq(libraryBooks.tenantId, tenantId), eq(libraryBooks.id, copy.legacyBookId)));
    await writeAuditLog(tx, { tenantId, actorUserId, action: "library.copy.issued", entityType: "library_issue", entityId: issue.id });
    return issue;
  });
}

export async function returnLibraryCopy(tenantId: string, actorUserId: string, issueId: string, returnedAt = new Date()) {
  await ensureLibrarySettings(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [settings] = await tx.select().from(librarySettings).where(eq(librarySettings.tenantId, tenantId)).limit(1);
    const [issue] = await tx.select().from(libraryIssues).where(and(eq(libraryIssues.tenantId, tenantId), eq(libraryIssues.id, issueId))).limit(1);
    if (!issue) throw new Phase9Error("Library issue not found.", 404);
    if (issue.returnedAt) return { issue, fine: null, alreadyReturned: true };
    const fine = calculateLibraryFine({ dueDate: issue.dueDate, returnedAt, finePerDayPaise: settings.finePerDayPaise });
    const [updated] = await tx.update(libraryIssues).set({ returnedAt, returnedBy: actorUserId, status: "returned", finePaise: fine.finePaise, updatedAt: new Date() }).where(and(eq(libraryIssues.tenantId, tenantId), eq(libraryIssues.id, issueId))).returning();
    const [copy] = await tx.update(libraryCopies).set({ status: "available", updatedAt: new Date() }).where(and(eq(libraryCopies.tenantId, tenantId), eq(libraryCopies.id, issue.copyId))).returning();
    if (copy?.legacyBookId) await tx.update(libraryBooks).set({ status: "available", updatedAt: new Date() }).where(and(eq(libraryBooks.tenantId, tenantId), eq(libraryBooks.id, copy.legacyBookId)));
    const fineRow = fine.finePaise > 0
      ? (await tx.insert(libraryFines).values({ tenantId, issueId, memberId: issue.memberId, amountPaise: fine.finePaise }).onConflictDoUpdate({ target: libraryFines.issueId, set: { amountPaise: fine.finePaise, status: "open", updatedAt: new Date() } }).returning())[0]
      : null;
    await writeAuditLog(tx, { tenantId, actorUserId, action: "library.copy.returned", entityType: "library_issue", entityId: issueId, metadata: fine });
    return { issue: updated, fine: fineRow, alreadyReturned: false };
  });
}

export async function renewLibraryIssue(tenantId: string, actorUserId: string, issueId: string) {
  await ensureLibrarySettings(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [settings] = await tx.select().from(librarySettings).where(eq(librarySettings.tenantId, tenantId)).limit(1);
    const [issue] = await tx.select().from(libraryIssues).where(and(eq(libraryIssues.tenantId, tenantId), eq(libraryIssues.id, issueId))).limit(1);
    if (!issue) throw new Phase9Error("Library issue not found.", 404);
    if (issue.returnedAt) throw new Phase9Error("Returned issues cannot be renewed.", 422);
    if (issue.renewCount >= settings.maxRenewals) throw new Phase9Error("Maximum renewals reached.", 422);
    const newDueDate = new Date(Date.now() + settings.defaultLoanDays * 86400000).toISOString().slice(0, 10);
    const [updated] = await tx.update(libraryIssues).set({ dueDate: newDueDate, renewCount: issue.renewCount + 1, updatedAt: new Date() }).where(and(eq(libraryIssues.tenantId, tenantId), eq(libraryIssues.id, issueId))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "library.issue.renewed", entityType: "library_issue", entityId: issueId, metadata: { newDueDate } });
    return updated;
  });
}

export async function lookupIsbn(isbn: string) {
  const cleanIsbn = isbn.replace(/[^0-9Xx]/g, "");
  if (!cleanIsbn) throw new Phase9Error("ISBN is required.", 400);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${cleanIsbn}.json`, { signal: controller.signal });
    if (!response.ok) return { isbn: cleanIsbn, found: false };
    const data = await response.json() as { title?: string; publishers?: string[]; publish_date?: string; covers?: number[] };
    return {
      isbn: cleanIsbn,
      found: true,
      title: data.title ?? null,
      publisher: data.publishers?.[0] ?? null,
      publishDate: data.publish_date ?? null,
      coverUrl: data.covers?.[0] ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg` : null,
    };
  } catch {
    return { isbn: cleanIsbn, found: false };
  } finally {
    clearTimeout(timeout);
  }
}

export async function createAcquisition(tenantId: string, actorUserId: string, input: { vendorName?: string | null; orderNumber?: string | null; orderDate?: string | null; items: Array<{ title: string; author?: string | null; isbn?: string | null; quantity: number; unitPricePaise?: number }> }) {
  return withTenant(tenantId, async (tx) => {
    const totalPaise = input.items.reduce((sum, item) => sum + item.quantity * (item.unitPricePaise ?? 0), 0);
    const [acquisition] = await tx.insert(libraryAcquisitions).values({ tenantId, vendorName: input.vendorName ?? null, orderNumber: input.orderNumber ?? null, orderDate: input.orderDate ?? null, totalPaise, createdBy: actorUserId }).returning();
    if (input.items.length) {
      await tx.insert(libraryAcquisitionItems).values(input.items.map((item) => ({ tenantId, acquisitionId: acquisition.id, title: item.title, author: item.author ?? null, isbn: item.isbn ?? null, quantity: item.quantity, unitPricePaise: item.unitPricePaise ?? 0 })));
    }
    return acquisition;
  });
}

export async function receiveAcquisition(tenantId: string, actorUserId: string, acquisitionId: string) {
  return withTenant(tenantId, async (tx) => {
    const items = await tx.select().from(libraryAcquisitionItems).where(and(eq(libraryAcquisitionItems.tenantId, tenantId), eq(libraryAcquisitionItems.acquisitionId, acquisitionId)));
    const copies = [];
    for (const item of items) {
      const title = await upsertTitle(tx, tenantId, { title: item.title, author: item.author, isbn: item.isbn });
      for (let i = item.receivedQuantity; i < item.quantity; i += 1) {
        const accession = await nextAccession(tx, tenantId);
        const [copy] = await tx.insert(libraryCopies).values({ tenantId, titleId: title.id, accession, barcode: accession, purchasePricePaise: item.unitPricePaise }).returning();
        copies.push(copy);
      }
      await tx.update(libraryAcquisitionItems).set({ titleId: title.id, receivedQuantity: item.quantity }).where(and(eq(libraryAcquisitionItems.tenantId, tenantId), eq(libraryAcquisitionItems.id, item.id)));
    }
    await tx.update(libraryAcquisitions).set({ status: "received", updatedAt: new Date() }).where(and(eq(libraryAcquisitions.tenantId, tenantId), eq(libraryAcquisitions.id, acquisitionId)));
    await writeAuditLog(tx, { tenantId, actorUserId, action: "library.acquisition.received", entityType: "library_acquisition", entityId: acquisitionId, metadata: { copies: copies.length } });
    return { copies };
  });
}
