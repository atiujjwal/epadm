import "./env-loader";

import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_DESCRIPTIONS, PERMISSIONS, USER_ROLES } from "@/lib/auth/catalog";
import { generateTotpSecret } from "@/lib/platform/auth/mfa";
import {
  db,
  permissions,
  rolePermissions,
  tenantUsers,
  tenants,
  users,
  tenantSubscriptions,
  staffProfiles,
  students,
  academicClasses,
  classSections,
  studentEnrollments,
  feeStructures,
  studentInvoices,
  staffPayroll,
  financialTransactions,
} from "@/lib/db";
import { opsDb, platformOperators } from "@/lib/db/ops";

async function seedAuthorizationCatalog() {
  for (const permission of PERMISSIONS) {
    await db
      .insert(permissions)
      .values({
        code: permission,
        description: PERMISSION_DESCRIPTIONS[permission],
      })
      .onConflictDoUpdate({
        target: permissions.code,
        set: {
          description: PERMISSION_DESCRIPTIONS[permission],
        },
      });
  }

  for (const role of USER_ROLES) {
    for (const permission of DEFAULT_ROLE_PERMISSIONS[role]) {
      await db
        .insert(rolePermissions)
        .values({
          role,
          permissionCode: permission,
        })
        .onConflictDoNothing();
    }
  }
}

async function seedDemoTenantAdmin() {
  const tenantSlug = process.env.SEED_TENANT_SLUG?.trim().toLowerCase() || "demo";
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || "admin@schoolapp.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim() || "password123";

  const tenantName = process.env.SEED_TENANT_NAME?.trim() || "Springfield Public School";
  const adminName = process.env.SEED_ADMIN_NAME?.trim() || "Platform Admin";

  let tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    [tenant] = await db
      .insert(tenants)
      .values({
        name: tenantName,
        slug: tenantSlug,
        subscriptionTier: "pro",
        isActive: true,
      })
      .returning();
  }

  let user = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!user) {
    const passwordHash = await argon2.hash(adminPassword);
    [user] = await db
      .insert(users)
      .values({
        name: adminName,
        email: adminEmail,
        passwordHash,
        isVerified: true,
        isActive: true,
      })
      .returning();
  }

  const existingMembership = await db.query.tenantUsers.findFirst({
    where: and(
      eq(tenantUsers.tenantId, tenant.id),
      eq(tenantUsers.userId, user.id),
      eq(tenantUsers.role, "admin"),
    ),
  });

  if (!existingMembership) {
    await db.insert(tenantUsers).values({
      tenantId: tenant.id,
      userId: user.id,
      role: "admin",
      isActive: true,
    });
  }

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  const defaultModules = ["Base ERP", "AI Suite", "Transport GPS", "Biometrics"];
  for (const moduleName of defaultModules) {
    await db
      .insert(tenantSubscriptions)
      .values({
        tenantId: tenant.id,
        moduleName,
        status: "active",
        billingCycleStart: now,
        billingCycleEnd: nextYear,
      })
      .onConflictDoNothing({
        target: [tenantSubscriptions.tenantId, tenantSubscriptions.moduleName],
      });
  }

  // Seed a demo teacher user
  const teacherEmail = "teacher@schoolapp.com";
  let teacherUser = await db.query.users.findFirst({
    where: eq(users.email, teacherEmail),
  });
  if (!teacherUser) {
    const passwordHash = await argon2.hash("password123");
    [teacherUser] = await db
      .insert(users)
      .values({
        name: "Jane Smith (Teacher)",
        email: teacherEmail,
        passwordHash,
        isVerified: true,
        isActive: true,
      })
      .returning();
  }

  let teacherMembership = await db.query.tenantUsers.findFirst({
    where: and(
      eq(tenantUsers.tenantId, tenant.id),
      eq(tenantUsers.userId, teacherUser.id),
      eq(tenantUsers.role, "teacher"),
    ),
  });
  if (!teacherMembership) {
    [teacherMembership] = await db
      .insert(tenantUsers)
      .values({
        tenantId: tenant.id,
        userId: teacherUser.id,
        role: "teacher",
        isActive: true,
      })
      .returning();
  }

  let teacherProfile = await db.query.staffProfiles.findFirst({
    where: and(
      eq(staffProfiles.tenantId, tenant.id),
      eq(staffProfiles.tenantUserId, teacherMembership.id),
    ),
  });
  if (!teacherProfile) {
    [teacherProfile] = await db
      .insert(staffProfiles)
      .values({
        tenantId: tenant.id,
        tenantUserId: teacherMembership.id,
        employeeCode: "EMP001",
        fullName: "Jane Smith",
        email: teacherEmail,
        department: "Science",
        jobTitle: "Senior Teacher",
        status: "active",
      })
      .returning();
  }

  // Seed a demo student user
  const studentEmail = "student@schoolapp.com";
  let studentUser = await db.query.users.findFirst({
    where: eq(users.email, studentEmail),
  });
  if (!studentUser) {
    const passwordHash = await argon2.hash("password123");
    [studentUser] = await db
      .insert(users)
      .values({
        name: "Bobby Brown (Student)",
        email: studentEmail,
        passwordHash,
        isVerified: true,
        isActive: true,
      })
      .returning();
  }

  let studentMembership = await db.query.tenantUsers.findFirst({
    where: and(
      eq(tenantUsers.tenantId, tenant.id),
      eq(tenantUsers.userId, studentUser.id),
      eq(tenantUsers.role, "student"),
    ),
  });
  if (!studentMembership) {
    [studentMembership] = await db
      .insert(tenantUsers)
      .values({
        tenantId: tenant.id,
        userId: studentUser.id,
        role: "student",
        isActive: true,
      })
      .returning();
  }

  let studentProfile = await db.query.students.findFirst({
    where: and(
      eq(students.tenantId, tenant.id),
      eq(students.tenantUserId, studentMembership.id),
    ),
  });
  if (!studentProfile) {
    [studentProfile] = await db
      .insert(students)
      .values({
        tenantId: tenant.id,
        tenantUserId: studentMembership.id,
        admissionNumber: "ADM001",
        firstName: "Bobby",
        lastName: "Brown",
        gender: "male",
        status: "active",
      })
      .returning();
  }

  // Seed academic class homeroomed to our teacher
  let demoClass = await db.query.academicClasses.findFirst({
    where: and(
      eq(academicClasses.tenantId, tenant.id),
      eq(academicClasses.code, "CLASS-10"),
    ),
  });
  if (!demoClass) {
    [demoClass] = await db
      .insert(academicClasses)
      .values({
        tenantId: tenant.id,
        code: "CLASS-10",
        name: "Class 10",
        academicYear: "2026-2027",
        homeroomStaffId: teacherProfile.id,
        status: "active",
      })
      .returning();
  }

  // Seed section
  let demoSection = await db.query.classSections.findFirst({
    where: and(
      eq(classSections.tenantId, tenant.id),
      eq(classSections.classId, demoClass.id),
      eq(classSections.name, "Section A"),
    ),
  });
  if (!demoSection) {
    [demoSection] = await db
      .insert(classSections)
      .values({
        tenantId: tenant.id,
        classId: demoClass.id,
        name: "Section A",
        capacity: 30,
        status: "active",
      })
      .returning();
  }

  // Enroll student
  let demoEnrollment = await db.query.studentEnrollments.findFirst({
    where: and(
      eq(studentEnrollments.tenantId, tenant.id),
      eq(studentEnrollments.studentId, studentProfile.id),
    ),
  });
  if (!demoEnrollment) {
    await db
      .insert(studentEnrollments)
      .values({
        tenantId: tenant.id,
        studentId: studentProfile.id,
        classId: demoClass.id,
        sectionId: demoSection.id,
        academicYear: "2026-2027",
        rollNumber: "1",
        status: "active",
      });
  }

  // 1. Seed Fee Structure
  let fee = await db.query.feeStructures.findFirst({
    where: and(
      eq(feeStructures.tenantId, tenant.id),
      eq(feeStructures.classId, demoClass.id),
      eq(feeStructures.name, "Monthly Tuition Fee"),
    ),
  });
  if (!fee) {
    [fee] = await db
      .insert(feeStructures)
      .values({
        tenantId: tenant.id,
        classId: demoClass.id,
        name: "Monthly Tuition Fee",
        amount: 5000,
        frequency: "monthly",
        academicYear: "2026-2027",
      })
      .returning();
  }

  // Retrieve student enrollment for references
  const enrolledStudent = await db.query.studentEnrollments.findFirst({
    where: and(
      eq(studentEnrollments.tenantId, tenant.id),
      eq(studentEnrollments.studentId, studentProfile.id),
    ),
  });

  if (enrolledStudent) {
    // 2. Seed Student Invoices
    let invoice1 = await db.query.studentInvoices.findFirst({
      where: and(
        eq(studentInvoices.tenantId, tenant.id),
        eq(studentInvoices.studentId, studentProfile.id),
        eq(studentInvoices.title, "Tuition Fee - April 2026"),
      ),
    });
    if (!invoice1) {
      [invoice1] = await db
        .insert(studentInvoices)
        .values({
          tenantId: tenant.id,
          studentId: studentProfile.id,
          enrollmentId: enrolledStudent.id,
          title: "Tuition Fee - April 2026",
          amount: 5000,
          dueDate: "2026-04-15",
          status: "paid",
        })
        .returning();

      // Seed Ledger entry for invoice 1 (credited)
      await db.insert(financialTransactions).values({
        tenantId: tenant.id,
        type: "credit",
        amount: 5000,
        date: "2026-04-10",
        description: "Payment received for invoice April 2026",
        invoiceId: invoice1.id,
        category: "fees",
      });
    }

    let invoice2 = await db.query.studentInvoices.findFirst({
      where: and(
        eq(studentInvoices.tenantId, tenant.id),
        eq(studentInvoices.studentId, studentProfile.id),
        eq(studentInvoices.title, "Tuition Fee - May 2026"),
      ),
    });
    if (!invoice2) {
      await db
        .insert(studentInvoices)
        .values({
          tenantId: tenant.id,
          studentId: studentProfile.id,
          enrollmentId: enrolledStudent.id,
          title: "Tuition Fee - May 2026",
          amount: 5000,
          dueDate: "2026-05-15",
          status: "pending",
        });
    }
  }

  // 3. Seed Staff Payroll
  let payroll = await db.query.staffPayroll.findFirst({
    where: and(
      eq(staffPayroll.tenantId, tenant.id),
      eq(staffPayroll.staffProfileId, teacherProfile.id),
      eq(staffPayroll.payPeriod, "2026-04"),
    ),
  });
  if (!payroll) {
    [payroll] = await db
      .insert(staffPayroll)
      .values({
        tenantId: tenant.id,
        staffProfileId: teacherProfile.id,
        basicSalary: 45000,
        allowances: 5000,
        deductions: 2000,
        paymentStatus: "paid",
        payPeriod: "2026-04",
        paidAt: new Date("2026-04-30"),
      })
      .returning();

    // Seed Ledger entry for payroll (debited)
    await db.insert(financialTransactions).values({
      tenantId: tenant.id,
      type: "debit",
      amount: 48000, // basic + allowance - deductions = 48000
      date: "2026-04-30",
      description: "Salary paid to staff Jane Smith (EMP001)",
      payrollId: payroll.id,
      category: "payroll",
    });
  }

  // Seed an unpaid payroll for May 2026
  let unpaidPayroll = await db.query.staffPayroll.findFirst({
    where: and(
      eq(staffPayroll.tenantId, tenant.id),
      eq(staffPayroll.staffProfileId, teacherProfile.id),
      eq(staffPayroll.payPeriod, "2026-05"),
    ),
  });
  if (!unpaidPayroll) {
    await db
      .insert(staffPayroll)
      .values({
        tenantId: tenant.id,
        staffProfileId: teacherProfile.id,
        basicSalary: 45000,
        allowances: 5000,
        deductions: 2000,
        paymentStatus: "unpaid",
        payPeriod: "2026-05",
      });
  }
}

async function seedPlatformOperator() {
  const email = process.env.SEED_PLATFORM_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_PLATFORM_PASSWORD?.trim();
  const name = process.env.SEED_PLATFORM_NAME?.trim() || "Platform Operator";
  const enableMfa = process.env.SEED_PLATFORM_MFA === "true";

  if (!email || !password) {
    return;
  }

  const existing = await opsDb.query.platformOperators.findFirst({
    where: eq(platformOperators.email, email),
  });

  if (existing) {
    return;
  }

  const passwordHash = await argon2.hash(password);
  const totpSecret = enableMfa ? generateTotpSecret() : null;

  await opsDb.insert(platformOperators).values({
    email,
    passwordHash,
    name,
    totpSecret,
    mfaEnabled: enableMfa,
    isActive: true,
  });

  if (enableMfa && totpSecret) {
    console.log(`Platform operator MFA secret (store securely): ${totpSecret}`);
  }
}

async function main() {
  await seedAuthorizationCatalog();
  await seedDemoTenantAdmin();
  await seedPlatformOperator();
  console.log("Seed completed.");
}

main().catch((error) => {
  console.error("Seed failed.", error);
  process.exit(1);
});
