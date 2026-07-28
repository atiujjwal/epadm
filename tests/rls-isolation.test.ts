import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq, like, sql } from "drizzle-orm";
import { Pool } from "pg";
import {
  academicClasses,
  academicYears,
  staffProfiles,
  studentEnrollments,
  studentInvoices,
  students,
} from "@/lib/db";
import { withTenant } from "@/lib/db/with-tenant";

const setupUrl = process.env.OPS_DATABASE_URL;
const stamp = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const admissionPrefix = `RLS-${stamp}`;

let setupPool: Pool;
const tenantAId = randomUUID();
const tenantBId = randomUUID();
let tenantAStudentId = "";
let tenantAStaffId = "";
let tenantAInvoiceId = "";

describe("cross-tenant RLS isolation", () => {
  beforeAll(async () => {
    if (!setupUrl) {
      throw new Error("OPS_DATABASE_URL must be set for isolation-test setup");
    }

    setupPool = new Pool({
      connectionString: setupUrl,
      max: 1,
      connectionTimeoutMillis: 5_000,
    });

    const runtimeRole = await withTenant(tenantAId, (tx) =>
      tx.execute<{
        current_user: string;
        rolsuper: boolean;
        rolbypassrls: boolean;
      }>(sql`select current_user,
                    (select rolsuper from pg_roles where rolname = current_user) as rolsuper,
                    (select rolbypassrls from pg_roles where rolname = current_user) as rolbypassrls`),
    );
    expect(runtimeRole.rows[0]?.rolsuper).toBe(false);
    expect(runtimeRole.rows[0]?.rolbypassrls).toBe(false);

    await setupPool.query(
      `insert into tenants (id, name, slug, subscription_tier, is_active)
       values ($1, $2, $3, 'basic', true), ($4, $5, $6, 'basic', true)`,
      [
        tenantAId,
        "RLS Test Tenant A",
        `rls-a-${stamp}`,
        tenantBId,
        "RLS Test Tenant B",
        `rls-b-${stamp}`,
      ],
    );

    await withTenant(tenantAId, async (tx) => {
      const [staff] = await tx
        .insert(staffProfiles)
        .values({
          tenantId: tenantAId,
          employeeCode: `EMP-A-${stamp}`,
          fullName: "Tenant A Staff",
        })
        .returning({ id: staffProfiles.id });
      tenantAStaffId = staff.id;

      const insertedStudents = await tx
        .insert(students)
        .values(
          [1, 2, 3].map((number) => ({
            tenantId: tenantAId,
            admissionNumber: `${admissionPrefix}-A${number}`,
            firstName: number === 1 ? "Original" : `Tenant A ${number}`,
          })),
        )
        .returning({ id: students.id, admissionNumber: students.admissionNumber });
      tenantAStudentId = insertedStudents[0].id;

      const [year] = await tx
        .insert(academicYears)
        .values({
          tenantId: tenantAId,
          name: `AY-${stamp}`.slice(0, 20),
          startDate: "2026-04-01",
          endDate: "2027-03-31",
        })
        .returning({ id: academicYears.id });

      const [academicClass] = await tx
        .insert(academicClasses)
        .values({
          tenantId: tenantAId,
          code: `C-${stamp}`.slice(0, 40),
          name: "Isolation Class",
          academicYear: "2026-27",
          academicYearId: year.id,
          classTeacherId: staff.id,
        })
        .returning({ id: academicClasses.id });

      const [enrollment] = await tx
        .insert(studentEnrollments)
        .values({
          tenantId: tenantAId,
          studentId: tenantAStudentId,
          classId: academicClass.id,
          academicYear: "2026-27",
        })
        .returning({ id: studentEnrollments.id });

      const [invoice] = await tx
        .insert(studentInvoices)
        .values({
          tenantId: tenantAId,
          studentId: tenantAStudentId,
          enrollmentId: enrollment.id,
          title: "Isolation Invoice",
          amount: 1000,
          dueDate: "2026-08-31",
        })
        .returning({ id: studentInvoices.id });
      tenantAInvoiceId = invoice.id;
    });

    await withTenant(tenantBId, (tx) =>
      tx.insert(students).values(
        [1, 2].map((number) => ({
          tenantId: tenantBId,
          admissionNumber: `${admissionPrefix}-B${number}`,
          firstName: `Tenant B ${number}`,
        })),
      ),
    );
  });

  afterAll(async () => {
    if (setupPool) {
      await setupPool.query("delete from tenants where id = any($1::uuid[])", [
        [tenantAId, tenantBId],
      ]);
      await setupPool.end();
    }
  });

  it("cannot read a student belonging to another tenant", async () => {
    const [result] = await withTenant(tenantBId, (tx) =>
      tx.select().from(students).where(eq(students.id, tenantAStudentId)).limit(1),
    );
    expect(result).toBeUndefined();
  });

  it("cannot read staff belonging to another tenant", async () => {
    const [result] = await withTenant(tenantBId, (tx) =>
      tx
        .select()
        .from(staffProfiles)
        .where(eq(staffProfiles.id, tenantAStaffId))
        .limit(1),
    );
    expect(result).toBeUndefined();
  });

  it("cannot read an invoice belonging to another tenant", async () => {
    const [result] = await withTenant(tenantBId, (tx) =>
      tx
        .select()
        .from(studentInvoices)
        .where(eq(studentInvoices.id, tenantAInvoiceId))
        .limit(1),
    );
    expect(result).toBeUndefined();
  });

  it("list queries return only the current tenant's records", async () => {
    const [tenantAStudents, tenantBStudents] = await Promise.all([
      withTenant(tenantAId, (tx) =>
        tx
          .select({ tenantId: students.tenantId })
          .from(students)
          .where(like(students.admissionNumber, `${admissionPrefix}-%`)),
      ),
      withTenant(tenantBId, (tx) =>
        tx
          .select({ tenantId: students.tenantId })
          .from(students)
          .where(like(students.admissionNumber, `${admissionPrefix}-%`)),
      ),
    ]);

    expect(tenantAStudents).toHaveLength(3);
    expect(tenantAStudents.every((row) => row.tenantId === tenantAId)).toBe(true);
    expect(tenantBStudents).toHaveLength(2);
    expect(tenantBStudents.every((row) => row.tenantId === tenantBId)).toBe(true);
  });

  it("cannot update a record belonging to another tenant", async () => {
    const changed = await withTenant(tenantBId, (tx) =>
      tx
        .update(students)
        .set({ firstName: "Hacked" })
        .where(
          and(
            eq(students.id, tenantAStudentId),
            eq(students.tenantId, tenantAId),
          ),
        )
        .returning({ id: students.id }),
    );
    expect(changed).toHaveLength(0);

    const [unchanged] = await withTenant(tenantAId, (tx) =>
      tx
        .select({ firstName: students.firstName })
        .from(students)
        .where(eq(students.id, tenantAStudentId))
        .limit(1),
    );
    expect(unchanged?.firstName).toBe("Original");
  });
});
