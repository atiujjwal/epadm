import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { libraryBooks } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const LIBRARY_READ_PERMISSION = "students.read" as const;
export const LIBRARY_WRITE_PERMISSION = "students.write" as const;

export type LibraryBookRecord = {
  id: string;
  accession: string;
  title: string;
  author: string | null;
  status: string;
  createdAt: Date;
};

export type CreateLibraryBookInput = {
  tenantId: string;
  accession: string;
  title: string;
  author?: string;
  status?: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function normalizeAccession(value: string) {
  return value.trim().toUpperCase();
}

export async function listLibraryBooks(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: libraryBooks.id,
        accession: libraryBooks.accession,
        title: libraryBooks.title,
        author: libraryBooks.author,
        status: libraryBooks.status,
        createdAt: libraryBooks.createdAt,
      })
      .from(libraryBooks)
      .where(
        search
          ? and(
              eq(libraryBooks.tenantId, tenantId),
              or(
                ilike(libraryBooks.accession, `%${search}%`),
                ilike(libraryBooks.title, `%${search}%`),
                ilike(libraryBooks.author, `%${search}%`),
              ),
            )
          : eq(libraryBooks.tenantId, tenantId),
      )
      .orderBy(desc(libraryBooks.createdAt), asc(libraryBooks.title)),
  );

  return rows satisfies LibraryBookRecord[];
}

export async function createLibraryBook(input: CreateLibraryBookInput) {
  const accession = normalizeAccession(input.accession);

  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.query.libraryBooks.findFirst({
      where: and(
        eq(libraryBooks.tenantId, input.tenantId),
        eq(libraryBooks.accession, accession),
      ),
    });

    if (existing) {
      throw new Error("A book with this accession number already exists.");
    }

    const [book] = await tx
      .insert(libraryBooks)
      .values({
        tenantId: input.tenantId,
        accession,
        title: input.title.trim(),
        author: clean(input.author),
        status: clean(input.status) ?? "available",
      })
      .returning();

    return book;
  });
}
