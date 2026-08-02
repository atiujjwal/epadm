import {
  sql,
} from "drizzle-orm";
import {
  date,
  integer,
  index,
  pgTable,
  pgSchema,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  primaryKey,
  text,
  bigint,
  numeric,
  time,
} from "drizzle-orm/pg-core";

export const platformSchema = pgSchema("platform");

/**
 * NOTE:
 * This is the first, minimal slice of the full schema from your architecture doc.
 * It defines the global identity + tenancy tables that everything else will build on.
 * Additional domain tables (students, fees, attendance, etc.) will be added here
 * in small, reviewable increments.
 */

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 1024 }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    isVerified: boolean("is_verified").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("users_email_unique").on(table.email),
      phoneIdx: uniqueIndex("users_phone_unique").on(table.phone),
    };
  },
);

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(), // subdomain
    logoUrl: varchar("logo_url", { length: 1024 }),
    address: varchar("address", { length: 1024 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pincode: varchar("pincode", { length: 10 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    affiliationBoard: varchar("affiliation_board", { length: 50 }),
    onboardingStatus: varchar("onboarding_status", { length: 20 })
      .$type<OnboardingStatus>()
      .notNull()
      .default("PENDING"),
    onboardingStep: integer("onboarding_step").notNull().default(1),
    foundationYear: integer("foundation_year"),
    shortName: varchar("short_name", { length: 80 }),
    academicYearStart: date("academic_year_start"),
    onboardingDraft: jsonb("onboarding_draft")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default("basic"),
    subscriptionExpiresAt: timestamp("subscription_expires_at", {
      withTimezone: true,
    }),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      slugIdx: uniqueIndex("tenants_slug_unique").on(table.slug),
    };
  },
);

export type OnboardingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type UserRole =
  | "superadmin"
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "hr"
  | "staff"
  | "accountant"
  | "librarian";

export const USER_ROLES = [
  "superadmin",
  "admin",
  "teacher",
  "student",
  "parent",
  "hr",
  "staff",
  "accountant",
  "librarian",
] as const satisfies readonly UserRole[];

export type PlanTier = "basic" | "pro" | "enterprise";

export type Permission =
  | "tenant.manage"
  | "users.read"
  | "users.write"
  | "academics.read"
  | "academics.write"
  | "academics.progression.read"
  | "staff.read"
  | "staff.write"
  | "students.read"
  | "students.write"
  | "students.create"
  | "students.update"
  | "students.export"
  | "students.import"
  | "students.archive"
  | "students.guardians.read"
  | "students.guardians.write"
  | "students.documents.read"
  | "students.documents.write"
  | "students.documents.verify"
  | "students.notes.read"
  | "students.notes.create"
  | "students.notes.safeguarding"
  | "attendance.read"
  | "attendance.write"
  | "fees.read"
  | "fees.write"
  | "announcements.read"
  | "announcements.write"
  | "reports.read"
  | "admissions.read"
  | "admissions.write"
  | "curriculum.read"
  | "curriculum.write"
  | "timetables.read"
  | "timetables.edit"
  | "timetables.settings.update"
  | "learning.read"
  | "assessments.read"
  | "assessments.plans.read"
  | "assessments.plans.write"
  | "assessments.schedule.read"
  | "assessments.schedule.write"
  | "assessments.marks.read"
  | "assessments.marks.write"
  | "assessments.marks.finalize"
  | "assessments.results.read"
  | "assessments.results.compute"
  | "assessments.results.publish"
  | "assessments.report-cards.read"
  | "assessments.report-cards.manage"
  | "assessments.report-cards.generate"
  | "hr.read"
  | "hr.staff.create"
  | "hr.staff.update"
  | "hr.staff.export"
  | "hr.staff.import"
  | "hr.staff.archive"
  | "hr.departments.read"
  | "hr.departments.create"
  | "hr.departments.update"
  | "hr.departments.archive"
  | "hr.qualifications.manage"
  | "payroll.read"
  | "payroll.settings.manage"
  | "payroll.components.manage"
  | "payroll.assignments.manage"
  | "payroll.runs.read"
  | "payroll.runs.create"
  | "payroll.runs.compute"
  | "payroll.runs.review"
  | "payroll.runs.lock"
  | "payroll.payslips.generate"
  | "payroll.payslips.download"
  | "payroll.loans.manage"
  | "payroll.statutory.read"
  | "hr.contracts.read"
  | "hr.contracts.write"
  | "hr.recruitment.read"
  | "hr.recruitment.write"
  | "hr.performance.read"
  | "hr.performance.write"
  | "hr.leave.read"
  | "hr.leave.write"
  | "hr.leave.approve"
  | "approvals.read"
  | "finance.fees.read"
  | "finance.fees.write"
  | "finance.fees.assign"
  | "finance.fees.invoices.generate"
  | "finance.fees.payments.record"
  | "finance.fees.void"
  | "finance.accounting.read"
  | "finance.accounting.accounts.manage"
  | "finance.accounting.expenses.record"
  | "transport.read"
  | "transport.fleet.write"
  | "transport.routes.manage"
  | "transport.allocations.manage"
  | "transport.maintenance.manage"
  | "transport.tracking.read"
  | "library.read"
  | "library.settings.manage"
  | "library.catalog.manage"
  | "library.members.manage"
  | "library.circulation.manage"
  | "library.fines.manage"
  | "library.acquisitions.manage"
  | "laboratories.read"
  | "laboratories.manage"
  | "laboratories.bookings.manage"
  | "laboratories.inventory.manage"
  | "laboratories.safety.manage"
  | "hostel.read"
  | "inventory.read"
  | "facilities.read"
  | "activities.read"
  | "communications.read"
  | "documents.read"
  | "digital-experience.configure"
  | "analytics.read"
  | "ai-studio.read"
  | "administration.read"
  | "administration.users.read"
  | "administration.users.create"
  | "administration.users.update"
  | "administration.users.deactivate"
  | "administration.users.reset"
  | "administration.school.read"
  | "administration.school.update"
  | "administration.roles.read"
  | "administration.roles.create"
  | "administration.roles.update"
  | "administration.audit.read"
  | "administration.integrations.read"
  | "administration.integrations.update";

export const PERMISSIONS = [
  "tenant.manage",
  "users.read",
  "users.write",
  "academics.read",
  "academics.write",
  "academics.progression.read",
  "staff.read",
  "staff.write",
  "students.read",
  "students.write",
  "students.create",
  "students.update",
  "students.export",
  "students.import",
  "students.archive",
  "students.guardians.read",
  "students.guardians.write",
  "students.documents.read",
  "students.documents.write",
  "students.documents.verify",
  "students.notes.read",
  "students.notes.create",
  "students.notes.safeguarding",
  "attendance.read",
  "attendance.write",
  "fees.read",
  "fees.write",
  "announcements.read",
  "announcements.write",
  "reports.read",
  "admissions.read",
  "admissions.write",
  "curriculum.read",
  "curriculum.write",
  "timetables.read",
  "timetables.edit",
  "timetables.settings.update",
  "learning.read",
  "assessments.read",
  "assessments.plans.read",
  "assessments.plans.write",
  "assessments.schedule.read",
  "assessments.schedule.write",
  "assessments.marks.read",
  "assessments.marks.write",
  "assessments.marks.finalize",
  "assessments.results.read",
  "assessments.results.compute",
  "assessments.results.publish",
  "assessments.report-cards.read",
  "assessments.report-cards.manage",
  "assessments.report-cards.generate",
  "hr.read",
  "hr.staff.create",
  "hr.staff.update",
  "hr.staff.export",
  "hr.staff.import",
  "hr.staff.archive",
  "hr.departments.read",
  "hr.departments.create",
  "hr.departments.update",
  "hr.departments.archive",
  "hr.qualifications.manage",
  "payroll.read",
  "payroll.settings.manage",
  "payroll.components.manage",
  "payroll.assignments.manage",
  "payroll.runs.read",
  "payroll.runs.create",
  "payroll.runs.compute",
  "payroll.runs.review",
  "payroll.runs.lock",
  "payroll.payslips.generate",
  "payroll.payslips.download",
  "payroll.loans.manage",
  "payroll.statutory.read",
  "hr.contracts.read",
  "hr.contracts.write",
  "hr.recruitment.read",
  "hr.recruitment.write",
  "hr.performance.read",
  "hr.performance.write",
  "hr.leave.read",
  "hr.leave.write",
  "hr.leave.approve",
  "approvals.read",
  "finance.fees.read",
  "finance.fees.write",
  "finance.fees.assign",
  "finance.fees.invoices.generate",
  "finance.fees.payments.record",
  "finance.fees.void",
  "finance.accounting.read",
  "finance.accounting.accounts.manage",
  "finance.accounting.expenses.record",
  "transport.read",
  "transport.fleet.write",
  "transport.routes.manage",
  "transport.allocations.manage",
  "transport.maintenance.manage",
  "transport.tracking.read",
  "library.read",
  "library.settings.manage",
  "library.catalog.manage",
  "library.members.manage",
  "library.circulation.manage",
  "library.fines.manage",
  "library.acquisitions.manage",
  "laboratories.read",
  "laboratories.manage",
  "laboratories.bookings.manage",
  "laboratories.inventory.manage",
  "laboratories.safety.manage",
  "hostel.read",
  "inventory.read",
  "facilities.read",
  "activities.read",
  "communications.read",
  "documents.read",
  "digital-experience.configure",
  "analytics.read",
  "ai-studio.read",
  "administration.read",
  "administration.users.read",
  "administration.users.create",
  "administration.users.update",
  "administration.users.deactivate",
  "administration.users.reset",
  "administration.school.read",
  "administration.school.update",
  "administration.roles.read",
  "administration.roles.create",
  "administration.roles.update",
  "administration.audit.read",
  "administration.integrations.read",
  "administration.integrations.update",
] as const satisfies readonly Permission[];

export type MembershipStatus = "active" | "invited" | "deactivated";

export const tenantUsers = pgTable(
  "tenant_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 30 }).$type<UserRole>().notNull(),
    customRoleId: uuid("custom_role_id"),
    membershipStatus: varchar("membership_status", { length: 20 })
      .$type<MembershipStatus>()
      .notNull()
      .default("active"),
    isActive: boolean("is_active").notNull().default(true),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantUserUnique: uniqueIndex("tenant_users_tenant_user_role_unique").on(
        table.tenantId,
        table.userId,
        table.role,
      ),
      tenantMembershipIdx: index("tenant_users_tenant_user_idx").on(
        table.tenantId,
        table.userId,
      ),
    };
  },
);

export const permissions = pgTable(
  "permissions",
  {
    code: varchar("code", { length: 100 }).$type<Permission>().primaryKey(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    role: varchar("role", { length: 30 }).$type<UserRole>().notNull(),
    permissionCode: varchar("permission_code", { length: 100 })
      .$type<Permission>()
      .notNull()
      .references(() => permissions.code, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "role_permissions_pk",
        columns: [table.role, table.permissionCode],
      }),
      roleIdx: index("role_permissions_role_idx").on(table.role),
    };
  },
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantActionIdx: index("audit_logs_tenant_action_idx").on(
        table.tenantId,
        table.action,
      ),
      tenantEntityIdx: index("audit_logs_tenant_entity_idx").on(
        table.tenantId,
        table.entityType,
        table.entityId,
      ),
    };
  },
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantUserId: uuid("tenant_user_id").references(() => tenantUsers.id, {
      onDelete: "set null",
    }),
    admissionNumber: varchar("admission_number", { length: 40 }).notNull(),
    admissionDate: date("admission_date"),
    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }),
    gender: varchar("gender", { length: 20 }),
    dateOfBirth: date("date_of_birth"),
    bloodGroup: varchar("blood_group", { length: 10 }),
    nationality: varchar("nationality", { length: 80 }).default("Indian"),
    religion: varchar("religion", { length: 80 }),
    category: varchar("category", { length: 80 }),
    motherTongue: varchar("mother_tongue", { length: 80 }),
    photoUrl: varchar("photo_url", { length: 1024 }),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pincode: varchar("pincode", { length: 20 }),
    emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
    classLabel: varchar("class_label", { length: 80 }),
    sectionLabel: varchar("section_label", { length: 80 }),
    guardianName: varchar("guardian_name", { length: 255 }),
    guardianPhone: varchar("guardian_phone", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archiveReason: text("archive_reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantAdmissionUnique: uniqueIndex("students_tenant_admission_unique").on(
        table.tenantId,
        table.admissionNumber,
      ),
      tenantStatusIdx: index("students_tenant_status_idx").on(
        table.tenantId,
        table.status,
      ),
    };
  },
);

export const staffProfiles = pgTable(
  "staff_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantUserId: uuid("tenant_user_id").references(() => tenantUsers.id, {
      onDelete: "set null",
    }),
    employeeCode: varchar("employee_code", { length: 40 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    department: varchar("department", { length: 120 }),
    departmentId: uuid("department_id"),
    jobTitle: varchar("job_title", { length: 120 }),
    dateOfBirth: date("date_of_birth"),
    gender: varchar("gender", { length: 20 }),
    bloodGroup: varchar("blood_group", { length: 10 }),
    nationality: varchar("nationality", { length: 80 }).default("Indian"),
    photoUrl: varchar("photo_url", { length: 1024 }),
    phonePrimary: varchar("phone_primary", { length: 20 }),
    phoneSecondary: varchar("phone_secondary", { length: 20 }),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pincode: varchar("pincode", { length: 20 }),
    emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
    employmentType: varchar("employment_type", { length: 40 })
      .notNull()
      .default("full_time"),
    joinedOn: date("joined_on"),
    leavingDate: date("leaving_date"),
    staffType: varchar("staff_type", { length: 30 }).notNull().default("teaching"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archiveReason: text("archive_reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantEmployeeUnique: uniqueIndex("staff_profiles_tenant_employee_unique").on(
        table.tenantId,
        table.employeeCode,
      ),
      tenantStaffStatusIdx: index("staff_profiles_tenant_status_idx").on(
        table.tenantId,
        table.status,
      ),
    };
  },
);

export const staffDepartments = pgTable(
  "staff_departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    headStaffId: uuid("head_staff_id").references(() => staffProfiles.id, {
      onDelete: "set null",
    }),
    isSystem: boolean("is_system").notNull().default(false),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    vacancies: integer("vacancies").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantDeptCodeUnique: uniqueIndex("staff_departments_tenant_code_unique").on(
        table.tenantId,
        table.code,
      ),
      tenantDeptStatusIdx: index("staff_departments_tenant_status_idx").on(
        table.tenantId,
        table.status,
      ),
    };
  },
);

export const campuses = pgTable(
  "campuses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    shortCode: varchar("short_code", { length: 40 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    isMain: boolean("is_main").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("campuses_tenant_name_unique").on(table.tenantId, table.name),
    tenantMainUnique: uniqueIndex("campuses_one_main_per_tenant")
      .on(table.tenantId)
      .where(sql`${table.isMain} = true`),
  }),
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    campusId: uuid("campus_id").references(() => campuses.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    roomType: varchar("room_type", { length: 30 }).notNull().default("classroom"),
    capacity: integer("capacity"),
    floor: varchar("floor", { length: 40 }),
    building: varchar("building", { length: 120 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("rooms_tenant_name_unique").on(table.tenantId, table.name),
    tenantCampusIdx: index("rooms_tenant_campus_idx").on(table.tenantId, table.campusId),
  }),
);

export const schoolHouses = pgTable(
  "school_houses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    color: varchar("color", { length: 20 }),
    motto: text("motto"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("school_houses_tenant_name_unique").on(
      table.tenantId,
      table.name,
    ),
  }),
);

export const curriculumFrameworks = pgTable(
  "curriculum_frameworks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    abbreviation: varchar("abbreviation", { length: 40 }),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("curriculum_frameworks_tenant_name_unique").on(
      table.tenantId,
      table.name,
    ),
  }),
);

export const academicYears = pgTable(
  "academic_years",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 20 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    isCurrent: boolean("is_current").notNull().default(false),
    campusId: uuid("campus_id").references(() => campuses.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantYearNameUnique: uniqueIndex("academic_years_tenant_name_unique").on(
        table.tenantId,
        table.name,
      ),
      tenantCurrentYearUnique: uniqueIndex("academic_years_tenant_current_unique")
        .on(table.tenantId)
        .where(sql`${table.isCurrent} = true`),
    };
  },
);

export const academicClasses = pgTable(
  "academic_classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, {
        onDelete: "restrict",
      }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    programName: varchar("program_name", { length: 80 }),
    displayOrder: integer("display_order").notNull().default(0),
    curriculumFrameworkId: uuid("curriculum_framework_id").references(
      () => curriculumFrameworks.id,
      { onDelete: "set null" },
    ),
    homeroomStaffId: uuid("homeroom_staff_id").references(() => staffProfiles.id, {
      onDelete: "set null",
    }),
    classTeacherId: uuid("class_teacher_id")
      .notNull()
      .references(() => staffProfiles.id, {
        onDelete: "restrict",
      }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantClassUnique: uniqueIndex("academic_classes_tenant_code_year_unique").on(
        table.tenantId,
        table.code,
        table.academicYear,
      ),
      tenantClassYearIdUnique: uniqueIndex("academic_classes_tenant_code_year_id_unique").on(
        table.tenantId,
        table.code,
        table.academicYearId,
      ),
      tenantClassStatusIdx: index("academic_classes_tenant_status_idx").on(
        table.tenantId,
        table.status,
      ),
    };
  },
);

export const classTeacherHistory = pgTable(
  "class_teacher_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "restrict" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    changedByUserId: uuid("changed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantClassTeacherIdx: index("class_teacher_history_tenant_class_idx").on(
        table.tenantId,
        table.classId,
      ),
      activeClassTeacherUnique: uniqueIndex("class_teacher_history_active_unique")
        .on(table.tenantId, table.classId)
        .where(sql`${table.endDate} is null`),
    };
  },
);

export const classSections = pgTable(
  "class_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    capacity: integer("capacity"),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "set null" }),
    houseId: uuid("house_id").references(() => schoolHouses.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantSectionUnique: uniqueIndex("class_sections_tenant_class_name_unique").on(
        table.tenantId,
        table.classId,
        table.name,
      ),
      tenantSectionStatusIdx: index("class_sections_tenant_status_idx").on(
        table.tenantId,
        table.status,
      ),
    };
  },
);

export const academicTerms = pgTable(
  "academic_terms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    displayOrder: integer("display_order").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    yearNameUnique: uniqueIndex("academic_terms_year_name_unique").on(
      table.academicYearId,
      table.name,
    ),
    yearOrderIdx: index("academic_terms_year_idx").on(
      table.academicYearId,
      table.displayOrder,
    ),
  }),
);

export const platformOperators = platformSchema.table(
  "operators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    totpSecret: varchar("totp_secret", { length: 512 }),
    mfaEnabled: boolean("mfa_enabled").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("platform_operators_email_unique").on(table.email),
  }),
);

export const tenantServices = platformSchema.table(
  "tenant_services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    serviceKey: varchar("service_key", { length: 50 }).notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantServiceUnique: uniqueIndex("tenant_service_unique").on(
      table.tenantId,
      table.serviceKey,
    ),
  }),
);

export const tenantSubscriptions = platformSchema.table(
  "tenant_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    moduleName: varchar("module_name", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    billingCycleStart: timestamp("billing_cycle_start", { withTimezone: true }).notNull(),
    billingCycleEnd: timestamp("billing_cycle_end", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantModuleUnique: uniqueIndex("tenant_subscription_module_unique").on(
      table.tenantId,
      table.moduleName,
    ),
  }),
);

export const tenantDailyMetrics = platformSchema.table(
  "tenant_daily_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull().defaultNow(),
    activeUsers: integer("active_users").notNull().default(0),
    dbStorageBytes: bigint("db_storage_bytes", { mode: "number" })
      .notNull()
      .default(0),
    totalAiTokens: integer("total_ai_tokens").notNull().default(0),
    computeCostInr: numeric("compute_cost_inr", { precision: 10, scale: 4 })
      .notNull()
      .default("0.0000"),
  },
  (table) => ({
    tenantDateUnique: uniqueIndex("tenant_date_unique").on(
      table.tenantId,
      table.logDate,
    ),
    metricsDateTenantIdx: index("idx_metrics_date_tenant").on(
      table.logDate,
      table.tenantId,
    ),
  }),
);

export const platformAuditLogs = platformSchema.table(
  "platform_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    operatorId: uuid("operator_id").references(() => platformOperators.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    actionIdx: index("platform_audit_logs_action_idx").on(table.action),
    entityIdx: index("platform_audit_logs_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
  }),
);

export const SERVICE_KEYS = [
  "biometric_sync",
  "ai_exam_gen",
  "timetable_ga",
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

export const studentEnrollments = pgTable(
  "student_enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id").references(() => classSections.id, {
      onDelete: "set null",
    }),
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    academicYearId: uuid("academic_year_id").references(() => academicYears.id, {
      onDelete: "restrict",
    }),
    rollNumber: varchar("roll_number", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    enrollmentStatus: varchar("enrollment_status", { length: 20 })
      .notNull()
      .default("active"),
    completionDate: date("completion_date"),
    promotionBasis: varchar("promotion_basis", { length: 40 }),
    enrolledOn: date("enrolled_on"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      tenantEnrollmentUnique: uniqueIndex("student_enrollments_tenant_student_year_unique").on(
        table.tenantId,
        table.studentId,
        table.academicYear,
      ),
      tenantClassYearIdx: index("student_enrollments_tenant_class_year_idx").on(
        table.tenantId,
        table.classId,
        table.academicYear,
      ),
    };
  },
);

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: varchar("status", { length: 20 }).notNull(), // "present", "absent", "late"
    notes: text("notes"),
    markedById: uuid("marked_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantStudentDateUnique: uniqueIndex("tenant_student_date_unique").on(
      table.tenantId,
      table.studentId,
      table.date,
    ),
  }),
);

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    dueDate: date("due_date").notNull(),
    filePath: varchar("file_path", { length: 1024 }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const feeCategories = pgTable(
  "fee_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("fee_categories_tenant_name_unique").on(
      table.tenantId,
      table.name,
    ),
  }),
);

export const feeStructures = pgTable(
  "fee_structures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id").references(() => academicYears.id, {
      onDelete: "set null",
    }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    amount: integer("amount").notNull(), // legacy rupee amount retained for compatibility
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull().default(0),
    totalAmountPaise: bigint("total_amount_paise", { mode: "number" }).notNull().default(0),
    frequency: varchar("frequency", { length: 20 }).notNull(), // "monthly", "quarterly", "annual"
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantClassFeeUnique: uniqueIndex("fee_structures_tenant_class_name_year_unique").on(
      table.tenantId,
      table.classId,
      table.name,
      table.academicYear,
    ),
    yearClassIdx: index("fee_structures_year_class_idx").on(
      table.tenantId,
      table.academicYearId,
      table.classId,
    ),
  }),
);

export const feeStructureItems = pgTable(
  "fee_structure_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    structureId: uuid("structure_id")
      .notNull()
      .references(() => feeStructures.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => feeCategories.id, { onDelete: "restrict" }),
    label: varchar("label", { length: 160 }).notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    isOptional: boolean("is_optional").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    structureIdx: index("fee_structure_items_structure_idx").on(table.structureId),
  }),
);

export const feePlans = pgTable(
  "fee_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    structureId: uuid("structure_id")
      .notNull()
      .references(() => feeStructures.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    planType: varchar("plan_type", { length: 20 }).notNull().default("custom"),
    lateFeePerDayPaise: bigint("late_fee_per_day_paise", { mode: "number" }).notNull().default(0),
    gracePeriodDays: integer("grace_period_days").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    structureNameUnique: uniqueIndex("fee_plans_structure_name_unique").on(
      table.structureId,
      table.name,
    ),
    defaultUnique: uniqueIndex("fee_plans_one_default_per_structure")
      .on(table.structureId)
      .where(sql`${table.isDefault} = true`),
  }),
);

export const feePlanInstallments = pgTable(
  "fee_plan_installments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => feePlans.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 160 }).notNull(),
    dueDate: date("due_date").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    displayOrder: integer("display_order").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    planDueIdx: index("fee_plan_installments_plan_idx").on(table.planId, table.dueDate),
  }),
);

export const studentFeeAssignments = pgTable(
  "student_fee_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    structureId: uuid("structure_id")
      .notNull()
      .references(() => feeStructures.id, { onDelete: "restrict" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => feePlans.id, { onDelete: "restrict" }),
    concessionType: varchar("concession_type", { length: 30 }),
    concessionAmountPaise: bigint("concession_amount_paise", { mode: "number" }).notNull().default(0),
    concessionNote: text("concession_note"),
    netAmountPaise: bigint("net_amount_paise", { mode: "number" }).notNull(),
    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    studentYearUnique: uniqueIndex("student_fee_assignments_student_year_unique").on(
      table.studentId,
      table.academicYearId,
    ),
    studentIdx: index("student_fee_assignments_student_idx").on(
      table.studentId,
      table.academicYearId,
    ),
  }),
);

export const invoiceSequences = pgTable("invoice_sequences", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  lastNumber: integer("last_number").notNull().default(0),
});

export const receiptSequences = pgTable("receipt_sequences", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  lastNumber: integer("last_number").notNull().default(0),
});

export const studentInvoices = pgTable(
  "student_invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => studentEnrollments.id, { onDelete: "cascade" }),
    assignmentId: uuid("assignment_id").references(() => studentFeeAssignments.id, {
      onDelete: "set null",
    }),
    installmentId: uuid("installment_id").references(() => feePlanInstallments.id, {
      onDelete: "set null",
    }),
    invoiceNumber: varchar("invoice_number", { length: 40 }),
    title: varchar("title", { length: 255 }).notNull(),
    periodLabel: varchar("period_label", { length: 120 }),
    amount: integer("amount").notNull(),
    subtotalPaise: bigint("subtotal_paise", { mode: "number" }),
    concessionPaise: bigint("concession_paise", { mode: "number" }).notNull().default(0),
    lateFeePaise: bigint("late_fee_paise", { mode: "number" }).notNull().default(0),
    totalPaise: bigint("total_paise", { mode: "number" }),
    paidPaise: bigint("paid_paise", { mode: "number" }).notNull().default(0),
    balancePaise: bigint("balance_paise", { mode: "number" }),
    dueDate: date("due_date").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "partial", "paid", "overdue", "voided"
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    voidReason: text("void_reason"),
    voidBy: uuid("void_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    invoiceNumberUnique: uniqueIndex("student_invoices_tenant_invoice_number_unique")
      .on(table.tenantId, table.invoiceNumber)
      .where(sql`${table.invoiceNumber} is not null`),
    assignmentInstallmentUnique: uniqueIndex("student_invoices_assignment_installment_unique")
      .on(table.tenantId, table.assignmentId, table.installmentId)
      .where(sql`${table.assignmentId} is not null and ${table.installmentId} is not null and ${table.voidedAt} is null`),
    studentDueIdx: index("student_invoices_student_due_idx").on(
      table.tenantId,
      table.studentId,
      table.dueDate,
    ),
  }),
);

export const staffPayroll = pgTable(
  "staff_payroll",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffProfileId: uuid("staff_profile_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    basicSalary: integer("basic_salary").notNull(),
    allowances: integer("allowances").notNull().default(0),
    deductions: integer("deductions").notNull().default(0),
    paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"), // "unpaid", "paid"
    payPeriod: varchar("pay_period", { length: 20 }).notNull(), // e.g. "2026-05"
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantStaffPeriodUnique: uniqueIndex("staff_payroll_tenant_staff_period_unique").on(
      table.tenantId,
      table.staffProfileId,
      table.payPeriod,
    ),
  }),
);

export const payrollComponents = pgTable(
  "payroll_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    code: varchar("code", { length: 40 }).notNull(),
    componentType: varchar("component_type", { length: 30 }).notNull(),
    calcType: varchar("calc_type", { length: 30 }).notNull().default("fixed"),
    defaultValue: numeric("default_value", { precision: 12, scale: 4 }),
    formula: text("formula"),
    isTaxable: boolean("is_taxable").notNull().default(false),
    isPfApplicable: boolean("is_pf_applicable").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("payroll_components_tenant_code_unique").on(table.tenantId, table.code),
    tenantOrderIdx: index("payroll_components_tenant_order_idx").on(table.tenantId, table.displayOrder),
  }),
);

export const payrollComponentAssignments = pgTable(
  "payroll_component_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    componentId: uuid("component_id")
      .notNull()
      .references(() => payrollComponents.id, { onDelete: "cascade" }),
    overrideValue: numeric("override_value", { precision: 12, scale: 4 }),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    staffComponentFromUnique: uniqueIndex("payroll_component_assignments_staff_component_from_unique").on(table.staffId, table.componentId, table.effectiveFrom),
    tenantStaffIdx: index("payroll_component_assignments_staff_idx").on(table.tenantId, table.staffId, table.effectiveFrom),
  }),
);

export const payrollSettings = pgTable("payroll_settings", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  pfEnabled: boolean("pf_enabled").notNull().default(true),
  pfEmployeeRate: numeric("pf_employee_rate", { precision: 5, scale: 2 }).notNull().default("12.00"),
  pfEmployerRate: numeric("pf_employer_rate", { precision: 5, scale: 2 }).notNull().default("12.00"),
  esiEnabled: boolean("esi_enabled").notNull().default(true),
  esiEmployeeRate: numeric("esi_employee_rate", { precision: 5, scale: 2 }).notNull().default("0.75"),
  esiEmployerRate: numeric("esi_employer_rate", { precision: 5, scale: 2 }).notNull().default("3.25"),
  esiGrossCeilingPaise: bigint("esi_gross_ceiling_paise", { mode: "number" }).notNull().default(2100000),
  ptEnabled: boolean("pt_enabled").notNull().default(true),
  ptState: varchar("pt_state", { length: 20 }),
  ptMonthlyPaise: bigint("pt_monthly_paise", { mode: "number" }).notNull().default(20000),
  ptThresholdPaise: bigint("pt_threshold_paise", { mode: "number" }).notNull().default(1000000),
  standardWorkingDays: integer("standard_working_days").notNull().default(26),
  payDay: integer("pay_day").notNull().default(1),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  absenceDeductionMode: varchar("absence_deduction_mode", { length: 30 }).notNull().default("gross_prorated"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payrollRuns = pgTable(
  "payroll_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id").references(() => academicYears.id, { onDelete: "set null" }),
    runMonth: integer("run_month").notNull(),
    runYear: integer("run_year").notNull(),
    runLabel: varchar("run_label", { length: 160 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    totalGrossPaise: bigint("total_gross_paise", { mode: "number" }).notNull().default(0),
    totalDeductionsPaise: bigint("total_deductions_paise", { mode: "number" }).notNull().default(0),
    totalNetPaise: bigint("total_net_paise", { mode: "number" }).notNull().default(0),
    staffCount: integer("staff_count").notNull().default(0),
    initiatedBy: uuid("initiated_by").references(() => users.id, { onDelete: "set null" }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    lockedBy: uuid("locked_by").references(() => users.id, { onDelete: "set null" }),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantMonthYearUnique: uniqueIndex("payroll_runs_tenant_month_year_unique").on(table.tenantId, table.runMonth, table.runYear),
    tenantMonthYearIdx: index("payroll_runs_month_year_idx").on(table.tenantId, table.runYear, table.runMonth),
  }),
);

export const payrollRunEntries = pgTable(
  "payroll_run_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    runId: uuid("run_id")
      .notNull()
      .references(() => payrollRuns.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    legacyPayrollId: uuid("legacy_payroll_id").references(() => staffPayroll.id, { onDelete: "set null" }),
    workingDays: integer("working_days").notNull().default(26),
    daysPresent: integer("days_present"),
    daysAbsent: integer("days_absent").notNull().default(0),
    grossPaise: bigint("gross_paise", { mode: "number" }).notNull().default(0),
    basicPaise: bigint("basic_paise", { mode: "number" }).notNull().default(0),
    pfEmployeePaise: bigint("pf_employee_paise", { mode: "number" }).notNull().default(0),
    esiEmployeePaise: bigint("esi_employee_paise", { mode: "number" }).notNull().default(0),
    professionalTaxPaise: bigint("professional_tax_paise", { mode: "number" }).notNull().default(0),
    tdsPaise: bigint("tds_paise", { mode: "number" }).notNull().default(0),
    loanEmiPaise: bigint("loan_emi_paise", { mode: "number" }).notNull().default(0),
    otherDeductionsPaise: bigint("other_deductions_paise", { mode: "number" }).notNull().default(0),
    totalDeductionsPaise: bigint("total_deductions_paise", { mode: "number" }).notNull().default(0),
    netPaise: bigint("net_paise", { mode: "number" }).notNull().default(0),
    pfEmployerPaise: bigint("pf_employer_paise", { mode: "number" }).notNull().default(0),
    esiEmployerPaise: bigint("esi_employer_paise", { mode: "number" }).notNull().default(0),
    isOnLeave: boolean("is_on_leave").notNull().default(false),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    runStaffUnique: uniqueIndex("payroll_run_entries_run_staff_unique").on(table.runId, table.staffId),
    tenantRunIdx: index("payroll_run_entries_run_idx").on(table.tenantId, table.runId),
    tenantStaffIdx: index("payroll_run_entries_staff_idx").on(table.tenantId, table.staffId),
  }),
);

export const payrollRunEntryLines = pgTable(
  "payroll_run_entry_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => payrollRunEntries.id, { onDelete: "cascade" }),
    componentId: uuid("component_id").references(() => payrollComponents.id, { onDelete: "set null" }),
    componentCode: varchar("component_code", { length: 40 }).notNull(),
    componentName: varchar("component_name", { length: 160 }).notNull(),
    componentType: varchar("component_type", { length: 30 }).notNull(),
    calcType: varchar("calc_type", { length: 30 }).notNull(),
    baseValuePaise: bigint("base_value_paise", { mode: "number" }),
    rate: numeric("rate", { precision: 8, scale: 4 }),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
  },
  (table) => ({
    entryComponentUnique: uniqueIndex("payroll_run_entry_lines_entry_component_unique").on(table.entryId, table.componentCode),
    tenantEntryIdx: index("payroll_run_entry_lines_entry_idx").on(table.tenantId, table.entryId),
  }),
);

export const payslips = pgTable(
  "payslips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => payrollRunEntries.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    pdfUrl: text("pdf_url"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    entryUnique: uniqueIndex("payslips_entry_unique").on(table.entryId),
    tenantStaffIdx: index("payslips_staff_idx").on(table.tenantId, table.staffId),
  }),
);

export const staffLoans = pgTable(
  "staff_loans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    loanType: varchar("loan_type", { length: 40 }).notNull().default("salary_advance"),
    principalPaise: bigint("principal_paise", { mode: "number" }).notNull(),
    outstandingPaise: bigint("outstanding_paise", { mode: "number" }).notNull(),
    emiPaise: bigint("emi_paise", { mode: "number" }).notNull(),
    installmentsPaid: integer("installments_paid").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantStaffIdx: index("staff_loans_staff_idx").on(table.tenantId, table.staffId),
  }),
);

export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => studentInvoices.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
    paymentDate: date("payment_date").notNull(),
    referenceNumber: varchar("reference_number", { length: 160 }),
    bankName: varchar("bank_name", { length: 160 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    gatewayPayload: jsonb("gateway_payload"),
    collectedBy: uuid("collected_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    invoiceIdx: index("payment_transactions_invoice_idx").on(table.invoiceId),
    studentDateIdx: index("payment_transactions_student_idx").on(
      table.studentId,
      table.paymentDate,
    ),
    tenantDateIdx: index("payment_transactions_date_idx").on(
      table.tenantId,
      table.paymentDate,
    ),
  }),
);

export const paymentReceipts = pgTable(
  "payment_receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => paymentTransactions.id, { onDelete: "cascade" }),
    receiptNumber: varchar("receipt_number", { length: 40 }).notNull(),
    pdfUrl: text("pdf_url"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    receiptNumberUnique: uniqueIndex("payment_receipts_tenant_receipt_number_unique").on(
      table.tenantId,
      table.receiptNumber,
    ),
    transactionUnique: uniqueIndex("payment_receipts_transaction_unique").on(table.transactionId),
  }),
);

export const financialAccounts = pgTable(
  "financial_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    isSystem: boolean("is_system").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("financial_accounts_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
    parentIdx: index("financial_accounts_parent_idx").on(table.tenantId, table.parentId),
  }),
);

export const financialTransactions = pgTable(
  "financial_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull(), // "credit" (incoming), "debit" (outgoing)
    amount: integer("amount").notNull(),
    date: date("date").notNull(),
    accountId: uuid("account_id").references(() => financialAccounts.id, { onDelete: "restrict" }),
    transactionType: varchar("transaction_type", { length: 20 }),
    amountPaise: bigint("amount_paise", { mode: "number" }),
    transactionDate: date("transaction_date"),
    description: text("description").notNull(),
    reference: varchar("reference", { length: 160 }),
    invoiceId: uuid("invoice_id").references(() => studentInvoices.id, { onDelete: "set null" }),
    paymentTransactionId: uuid("payment_transaction_id").references(() => paymentTransactions.id, { onDelete: "set null" }),
    payrollId: uuid("payroll_id").references(() => staffPayroll.id, { onDelete: "set null" }),
    category: varchar("category", { length: 80 }).notNull(), // "fees", "payroll", "maintenance", etc.
    source: varchar("source", { length: 40 }),
    sourceId: uuid("source_id"),
    receiptPhotoUrl: text("receipt_photo_url"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantDateIdx: index("financial_transactions_tenant_date_idx").on(
      table.tenantId,
      table.transactionDate,
    ),
    accountDateIdx: index("financial_transactions_account_date_idx").on(
      table.accountId,
      table.transactionDate,
    ),
    sourceIdx: index("financial_transactions_source_idx").on(table.tenantId, table.source, table.sourceId),
  }),
);

export const exams = pgTable(
  "exams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 120 }).notNull(),
    gradeLevel: varchar("grade_level", { length: 50 }).notNull(),
    difficulty: varchar("difficulty", { length: 50 }).notNull(),
    format: varchar("format", { length: 50 }).notNull(),
    content: jsonb("content").notNull(),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const vehicleTelemetry = pgTable(
  "vehicle_telemetry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vehicleId: varchar("vehicle_id", { length: 100 }).notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    speed: integer("speed"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

// --- Wave 1: academics / attendance extensions ---

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 40 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("subjects_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
    tenantStatusIdx: index("subjects_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
  }),
);

export const curriculumOfferings = pgTable(
  "curriculum_offerings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    isCore: boolean("is_core").notNull().default(true),
    periodsPerWeek: integer("periods_per_week").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    yearClassSubjectUnique: uniqueIndex("curriculum_offerings_year_class_subject_unique").on(
      table.academicYearId,
      table.classId,
      table.subjectId,
    ),
    yearClassIdx: index("curriculum_offerings_class_idx").on(
      table.academicYearId,
      table.classId,
    ),
  }),
);

export const teacherAllocations = pgTable(
  "teacher_allocations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    offeringId: uuid("offering_id")
      .notNull()
      .references(() => curriculumOfferings.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    offeringSectionStaffUnique: uniqueIndex("teacher_allocations_offering_section_staff_unique").on(
      table.offeringId,
      table.sectionId,
      table.staffId,
    ),
    staffIdx: index("teacher_allocations_staff_idx").on(table.staffId, table.offeringId),
    sectionIdx: index("teacher_allocations_section_idx").on(table.sectionId),
  }),
);

export const timetablePeriods = pgTable(
  "timetable_periods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    isBreak: boolean("is_break").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("timetable_periods_tenant_name_unique").on(
      table.tenantId,
      table.name,
    ),
  }),
);

export const timetableVersions = pgTable(
  "timetable_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedBy: uuid("published_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    yearNameUnique: uniqueIndex("timetable_versions_year_name_unique").on(
      table.academicYearId,
      table.name,
    ),
    onePublishedPerYear: uniqueIndex("timetable_versions_one_published_per_year")
      .on(table.tenantId, table.academicYearId)
      .where(sql`${table.status} = 'published'`),
  }),
);

export const timetableSlots = pgTable(
  "timetable_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    versionId: uuid("version_id")
      .notNull()
      .references(() => timetableVersions.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    offeringId: uuid("offering_id")
      .notNull()
      .references(() => curriculumOfferings.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "restrict" }),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "set null" }),
    periodId: uuid("period_id")
      .notNull()
      .references(() => timetablePeriods.id, { onDelete: "restrict" }),
    dayOfWeek: integer("day_of_week").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sectionPeriodUnique: uniqueIndex("timetable_slots_version_section_period_day_unique").on(
      table.versionId,
      table.sectionId,
      table.periodId,
      table.dayOfWeek,
    ),
    staffPeriodUnique: uniqueIndex("timetable_slots_version_staff_period_day_unique").on(
      table.versionId,
      table.staffId,
      table.periodId,
      table.dayOfWeek,
    ),
    roomPeriodUnique: uniqueIndex("timetable_slots_version_room_period_day_unique").on(
      table.versionId,
      table.roomId,
      table.periodId,
      table.dayOfWeek,
    ),
    versionSectionIdx: index("timetable_slots_version_section_idx").on(
      table.versionId,
      table.sectionId,
      table.dayOfWeek,
    ),
    versionStaffIdx: index("timetable_slots_version_staff_idx").on(
      table.versionId,
      table.staffId,
      table.dayOfWeek,
    ),
  }),
);

export const gradebookColumns = pgTable(
  "gradebook_columns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    termId: uuid("term_id").references(() => academicTerms.id, {
      onDelete: "set null",
    }),
    offeringId: uuid("offering_id")
      .notNull()
      .references(() => curriculumOfferings.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).notNull(),
    maxMarks: numeric("max_marks", { precision: 6, scale: 2 }).notNull().default("100.00"),
    assessmentTypeId: uuid("assessment_type_id").references(() => assessmentTypes.id, {
      onDelete: "set null",
    }),
    dueDate: date("due_date"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantSectionIdx: index("gradebook_columns_tenant_section_idx").on(
      table.tenantId,
      table.sectionId,
    ),
    columnUnique: uniqueIndex("gradebook_columns_offering_section_title_unique").on(
      table.offeringId,
      table.sectionId,
      table.title,
    ),
  }),
);

export const gradebookEntries = pgTable(
  "gradebook_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    columnId: uuid("column_id")
      .notNull()
      .references(() => gradebookColumns.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    marksObtained: numeric("marks_obtained", { precision: 6, scale: 2 }),
    isAbsent: boolean("is_absent").notNull().default(false),
    isExempt: boolean("is_exempt").notNull().default(false),
    remarks: text("remarks"),
    enteredBy: uuid("entered_by").references(() => users.id, { onDelete: "set null" }),
    enteredAt: timestamp("entered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    columnStudentUnique: uniqueIndex("gradebook_entries_column_student_unique").on(
      table.columnId,
      table.studentId,
    ),
    studentIdx: index("gradebook_entries_student_idx").on(table.studentId),
  }),
);

export const assessmentTypes = pgTable(
  "assessment_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 40 }).notNull(),
    category: varchar("category", { length: 30 }).notNull().default("exam"),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("assessment_types_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
  }),
);

export const assessmentPlans = pgTable(
  "assessment_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    termId: uuid("term_id").references(() => academicTerms.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 180 }).notNull(),
    appliesToClass: uuid("applies_to_class").references(() => academicClasses.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    maxMarks: numeric("max_marks", { precision: 6, scale: 2 }).notNull().default("100.00"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    yearIdx: index("assessment_plans_year_idx").on(table.academicYearId, table.termId),
    activeClassScopeUnique: uniqueIndex("assessment_plans_one_active_class_scope").on(
      table.tenantId,
      table.academicYearId,
      table.termId,
      table.appliesToClass,
    ).where(sql`${table.status} = 'active' and ${table.appliesToClass} is not null`),
    activeAllScopeUnique: uniqueIndex("assessment_plans_one_active_all_scope").on(
      table.tenantId,
      table.academicYearId,
      table.termId,
    ).where(sql`${table.status} = 'active' and ${table.appliesToClass} is null`),
  }),
);

export const assessmentPlanComponents = pgTable(
  "assessment_plan_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => assessmentPlans.id, { onDelete: "cascade" }),
    assessmentTypeId: uuid("assessment_type_id")
      .notNull()
      .references(() => assessmentTypes.id, { onDelete: "restrict" }),
    weightPercent: numeric("weight_percent", { precision: 5, scale: 2 }).notNull(),
    maxMarks: numeric("max_marks", { precision: 6, scale: 2 }).notNull(),
    isGradebookSource: boolean("is_gradebook_source").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    planTypeUnique: uniqueIndex("assessment_plan_components_plan_type_unique").on(
      table.planId,
      table.assessmentTypeId,
    ),
  }),
);

export const gradeScales = pgTable(
  "grade_scales",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("grade_scales_tenant_name_unique").on(
      table.tenantId,
      table.name,
    ),
    defaultUnique: uniqueIndex("grade_scales_one_default_per_tenant")
      .on(table.tenantId)
      .where(sql`${table.isDefault} = true`),
  }),
);

export const gradeScaleBands = pgTable(
  "grade_scale_bands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    scaleId: uuid("scale_id")
      .notNull()
      .references(() => gradeScales.id, { onDelete: "cascade" }),
    gradeLabel: varchar("grade_label", { length: 30 }).notNull(),
    minPercent: numeric("min_percent", { precision: 5, scale: 2 }).notNull(),
    maxPercent: numeric("max_percent", { precision: 5, scale: 2 }).notNull(),
    gradePoint: numeric("grade_point", { precision: 4, scale: 2 }),
    remark: text("remark"),
    isPass: boolean("is_pass").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => ({
    scaleLabelUnique: uniqueIndex("grade_scale_bands_scale_label_unique").on(
      table.scaleId,
      table.gradeLabel,
    ),
  }),
);

export const examEvents = pgTable(
  "exam_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => assessmentPlans.id, { onDelete: "cascade" }),
    assessmentTypeId: uuid("assessment_type_id")
      .notNull()
      .references(() => assessmentTypes.id, { onDelete: "restrict" }),
    offeringId: uuid("offering_id")
      .notNull()
      .references(() => curriculumOfferings.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    examDate: date("exam_date").notNull(),
    startTime: time("start_time"),
    durationMinutes: integer("duration_minutes"),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "set null" }),
    invigilatorId: uuid("invigilator_id").references(() => staffProfiles.id, {
      onDelete: "set null",
    }),
    maxMarks: numeric("max_marks", { precision: 6, scale: 2 }).notNull(),
    passingMarks: numeric("passing_marks", { precision: 6, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    marksFinalized: boolean("marks_finalized").notNull().default(false),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    typeOfferingSectionDateUnique: uniqueIndex("exam_events_type_offering_section_date_unique").on(
      table.assessmentTypeId,
      table.offeringId,
      table.sectionId,
      table.examDate,
    ),
    dateIdx: index("exam_events_date_idx").on(
      table.tenantId,
      table.academicYearId,
      table.examDate,
    ),
    sectionIdx: index("exam_events_section_idx").on(table.sectionId, table.academicYearId),
  }),
);

export const examMarks = pgTable(
  "exam_marks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    examEventId: uuid("exam_event_id")
      .notNull()
      .references(() => examEvents.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    marksObtained: numeric("marks_obtained", { precision: 6, scale: 2 }),
    isAbsent: boolean("is_absent").notNull().default(false),
    isExempt: boolean("is_exempt").notNull().default(false),
    remarks: text("remarks"),
    enteredBy: uuid("entered_by").references(() => users.id, { onDelete: "set null" }),
    enteredAt: timestamp("entered_at", { withTimezone: true }).notNull().defaultNow(),
    verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventStudentUnique: uniqueIndex("exam_marks_event_student_unique").on(
      table.examEventId,
      table.studentId,
    ),
    eventIdx: index("exam_marks_event_idx").on(table.examEventId),
    studentIdx: index("exam_marks_student_idx").on(table.studentId),
  }),
);

export const studentResults = pgTable(
  "student_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    termId: uuid("term_id").references(() => academicTerms.id, { onDelete: "set null" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => assessmentPlans.id, { onDelete: "cascade" }),
    offeringId: uuid("offering_id")
      .notNull()
      .references(() => curriculumOfferings.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    totalMarksObtained: numeric("total_marks_obtained", { precision: 6, scale: 2 }),
    totalMarksMax: numeric("total_marks_max", { precision: 6, scale: 2 }),
    percentage: numeric("percentage", { precision: 5, scale: 2 }),
    gradeLabel: varchar("grade_label", { length: 30 }),
    gradePoint: numeric("grade_point", { precision: 4, scale: 2 }),
    isPass: boolean("is_pass"),
    classRank: integer("class_rank"),
    computedAt: timestamp("computed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => ({
    studentPlanOfferingUnique: uniqueIndex("student_results_student_plan_offering_unique").on(
      table.studentId,
      table.planId,
      table.offeringId,
    ),
    planSectionIdx: index("student_results_plan_section_idx").on(table.planId, table.sectionId),
    studentIdx: index("student_results_student_idx").on(
      table.studentId,
      table.academicYearId,
    ),
  }),
);

export const reportCardTemplates = pgTable(
  "report_card_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    planId: uuid("plan_id").references(() => assessmentPlans.id, {
      onDelete: "set null",
    }),
    isDefault: boolean("is_default").notNull().default(false),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    defaultUnique: uniqueIndex("report_card_templates_one_default_per_tenant")
      .on(table.tenantId)
      .where(sql`${table.isDefault} = true`),
  }),
);

export const reportCardGenerations = pgTable(
  "report_card_generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => assessmentPlans.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => reportCardTemplates.id, {
      onDelete: "set null",
    }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => classSections.id, { onDelete: "cascade" }),
    pdfUrl: text("pdf_url"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    errorMessage: text("error_message"),
    generatedBy: uuid("generated_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    studentPlanUnique: uniqueIndex("report_card_generations_student_plan_unique").on(
      table.studentId,
      table.planId,
    ),
    planSectionIdx: index("report_card_generations_plan_section_idx").on(
      table.planId,
      table.sectionId,
    ),
  }),
);

export const staffContracts = pgTable(
  "staff_contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    contractType: varchar("contract_type", { length: 30 }).notNull().default("permanent"),
    title: varchar("title", { length: 160 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    grossSalaryPaise: bigint("gross_salary_paise", { mode: "number" }).notNull(),
    basicSalaryPaise: bigint("basic_salary_paise", { mode: "number" }).notNull(),
    noticePeriodDays: integer("notice_period_days").notNull().default(30),
    documentUrl: text("document_url"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantStaffIdx: index("staff_contracts_staff_idx").on(table.tenantId, table.staffId, table.startDate),
  }),
);

export const recruitmentPostings = pgTable(
  "recruitment_postings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => staffDepartments.id, { onDelete: "set null" }),
    title: varchar("title", { length: 160 }).notNull(),
    description: text(),
    employmentType: varchar("employment_type", { length: 40 }).notNull().default("full_time"),
    openings: integer("openings").notNull().default(1),
    salaryRangeMinPaise: bigint("salary_range_min_paise", { mode: "number" }),
    salaryRangeMaxPaise: bigint("salary_range_max_paise", { mode: "number" }),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    closesOn: date("closes_on"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantStatusIdx: index("recruitment_postings_tenant_status_idx").on(table.tenantId, table.status),
  }),
);

export const recruitmentApplications = pgTable(
  "recruitment_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    postingId: uuid("posting_id")
      .notNull()
      .references(() => recruitmentPostings.id, { onDelete: "cascade" }),
    candidateName: varchar("candidate_name", { length: 160 }).notNull(),
    candidateEmail: varchar("candidate_email", { length: 255 }),
    candidatePhone: varchar("candidate_phone", { length: 40 }),
    resumeUrl: text("resume_url"),
    currentCtcPaise: bigint("current_ctc_paise", { mode: "number" }),
    expectedCtcPaise: bigint("expected_ctc_paise", { mode: "number" }),
    stage: varchar("stage", { length: 30 }).notNull().default("applied"),
    source: varchar("source", { length: 80 }),
    notes: text("notes"),
    hiredStaffId: uuid("hired_staff_id").references(() => staffProfiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    postingStageIdx: index("recruitment_applications_posting_stage_idx").on(table.tenantId, table.postingId, table.stage),
  }),
);

export const recruitmentInterviews = pgTable(
  "recruitment_interviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => recruitmentApplications.id, { onDelete: "cascade" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    interviewerUserId: uuid("interviewer_user_id").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    feedback: text("feedback"),
    rating: numeric("rating", { precision: 4, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantApplicationIdx: index("recruitment_interviews_application_idx").on(table.tenantId, table.applicationId),
  }),
);

export const recruitmentOffers = pgTable(
  "recruitment_offers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => recruitmentApplications.id, { onDelete: "cascade" }),
    offeredRole: varchar("offered_role", { length: 160 }).notNull(),
    offeredCtcPaise: bigint("offered_ctc_paise", { mode: "number" }).notNull(),
    joiningDate: date("joining_date"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    documentUrl: text("document_url"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    applicationUnique: uniqueIndex("recruitment_offers_application_unique").on(table.applicationId),
  }),
);

export const performanceCycles = pgTable(
  "performance_cycles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id").references(() => academicYears.id, { onDelete: "set null" }),
    name: varchar("name", { length: 160 }).notNull(),
    reviewPeriodStart: date("review_period_start").notNull(),
    reviewPeriodEnd: date("review_period_end").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("performance_cycles_tenant_name_unique").on(table.tenantId, table.name),
  }),
);

export const performanceReviews = pgTable(
  "performance_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => performanceCycles.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    reviewerUserId: uuid("reviewer_user_id").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 30 }).notNull().default("pending_self"),
    selfAssessment: jsonb("self_assessment").$type<Record<string, unknown>>(),
    reviewerComments: text("reviewer_comments"),
    dimensionRatings: jsonb("dimension_ratings").$type<Record<string, number>>(),
    overallRating: numeric("overall_rating", { precision: 4, scale: 2 }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    cycleStaffUnique: uniqueIndex("performance_reviews_cycle_staff_unique").on(table.cycleId, table.staffId),
    tenantReviewerIdx: index("performance_reviews_reviewer_idx").on(table.tenantId, table.reviewerUserId),
  }),
);

export const staffLeaveTypes = pgTable(
  "staff_leave_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 30 }).notNull(),
    annualAllowanceDays: numeric("annual_allowance_days", { precision: 6, scale: 2 }).notNull().default("0.00"),
    requiresL2: boolean("requires_l2").notNull().default(false),
    l2ThresholdDays: numeric("l2_threshold_days", { precision: 6, scale: 2 }).notNull().default("5.00"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("staff_leave_types_tenant_code_unique").on(table.tenantId, table.code),
  }),
);

export const staffLeaveBalances = pgTable(
  "staff_leave_balances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    leaveTypeId: uuid("leave_type_id")
      .notNull()
      .references(() => staffLeaveTypes.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id").references(() => academicYears.id, { onDelete: "set null" }),
    creditedDays: numeric("credited_days", { precision: 6, scale: 2 }).notNull().default("0.00"),
    usedDays: numeric("used_days", { precision: 6, scale: 2 }).notNull().default("0.00"),
    balanceDays: numeric("balance_days", { precision: 6, scale: 2 }).notNull().default("0.00"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    staffTypeYearUnique: uniqueIndex("staff_leave_balances_staff_type_year_unique").on(table.staffId, table.leaveTypeId, table.academicYearId),
  }),
);

export const staffLeaveRequests = pgTable(
  "staff_leave_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    leaveTypeId: uuid("leave_type_id")
      .notNull()
      .references(() => staffLeaveTypes.id, { onDelete: "restrict" }),
    fromDate: date("from_date").notNull(),
    toDate: date("to_date").notNull(),
    days: numeric("days", { precision: 6, scale: 2 }).notNull(),
    reason: text("reason"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    requiresL2: boolean("requires_l2").notNull().default(false),
    approverL1: uuid("approver_l1").references(() => users.id, { onDelete: "set null" }),
    approverL2: uuid("approver_l2").references(() => users.id, { onDelete: "set null" }),
    l1ApprovedBy: uuid("l1_approved_by").references(() => users.id, { onDelete: "set null" }),
    l1ApprovedAt: timestamp("l1_approved_at", { withTimezone: true }),
    l2ApprovedBy: uuid("l2_approved_by").references(() => users.id, { onDelete: "set null" }),
    l2ApprovedAt: timestamp("l2_approved_at", { withTimezone: true }),
    rejectedBy: uuid("rejected_by").references(() => users.id, { onDelete: "set null" }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionNote: text("rejection_note"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    staffDateIdx: index("staff_leave_requests_staff_date_idx").on(table.tenantId, table.staffId, table.fromDate),
    approverIdx: index("staff_leave_requests_approver_idx").on(table.tenantId, table.approverL1, table.approverL2, table.status),
  }),
);

export const leaveApplications = pgTable(
  "leave_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    fromDate: date("from_date").notNull(),
    toDate: date("to_date").notNull(),
    reason: text("reason"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantStudentIdx: index("leave_applications_tenant_student_idx").on(
      table.tenantId,
      table.studentId,
    ),
    tenantStatusIdx: index("leave_applications_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
  }),
);

export const holidays = pgTable(
  "holidays",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantDateIdx: index("holidays_tenant_date_idx").on(table.tenantId, table.date),
  }),
);

// --- Wave 2: operational domains ---

export const admissionApplications = pgTable(
  "admission_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    applicantName: varchar("applicant_name", { length: 255 }).notNull(),
    grade: varchar("grade", { length: 40 }).notNull(),
    stage: varchar("stage", { length: 60 }).notNull().default("inquiry"),
    fitScore: integer("fit_score"),
    owner: varchar("owner", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantStageIdx: index("admission_applications_tenant_stage_idx").on(
      table.tenantId,
      table.stage,
    ),
    tenantStatusIdx: index("admission_applications_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
  }),
);

export const timetableEntries = pgTable(
  "timetable_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    period: integer("period").notNull(),
    classLabel: varchar("class_label", { length: 80 }).notNull(),
    subject: varchar("subject", { length: 120 }).notNull(),
    room: varchar("room", { length: 80 }),
    teacherName: varchar("teacher_name", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantDayPeriodIdx: index("timetable_entries_tenant_day_period_idx").on(
      table.tenantId,
      table.dayOfWeek,
      table.period,
    ),
  }),
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    numberPlate: varchar("number_plate", { length: 40 }).notNull(),
    driverName: varchar("driver_name", { length: 255 }),
    driverPhone: varchar("driver_phone", { length: 30 }),
    helperName: varchar("helper_name", { length: 255 }),
    helperPhone: varchar("helper_phone", { length: 30 }),
    routeName: varchar("route_name", { length: 120 }),
    capacity: integer("capacity").notNull().default(0),
    makeModel: varchar("make_model", { length: 120 }),
    fuelType: varchar("fuel_type", { length: 30 }),
    gpsDeviceId: varchar("gps_device_id", { length: 100 }),
    insuranceExpiry: date("insurance_expiry"),
    fitnessExpiry: date("fitness_expiry"),
    permitExpiry: date("permit_expiry"),
    pollutionExpiry: date("pollution_expiry"),
    lastServiceDate: date("last_service_date"),
    nextServiceDate: date("next_service_date"),
    studentCount: integer("student_count").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("vehicles_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
    tenantStatusIdx: index("vehicles_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
    tenantGpsDeviceUnique: uniqueIndex("vehicles_tenant_gps_device_unique").on(
      table.tenantId,
      table.gpsDeviceId,
    ),
  }),
);

export const vehicleRoutes = pgTable(
  "vehicle_routes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    routeCode: varchar("route_code", { length: 40 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    driverName: varchar("driver_name", { length: 255 }),
    helperName: varchar("helper_name", { length: 255 }),
    distanceKm: numeric("distance_km", { precision: 8, scale: 2 }),
    monthlyFeePaise: bigint("monthly_fee_paise", { mode: "number" }).notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("vehicle_routes_tenant_code_unique").on(table.tenantId, table.routeCode),
    tenantStatusIdx: index("vehicle_routes_tenant_status_idx").on(table.tenantId, table.status),
  }),
);

export const routeStops = pgTable(
  "route_stops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    routeId: uuid("route_id").notNull().references(() => vehicleRoutes.id, { onDelete: "cascade" }),
    stopName: varchar("stop_name", { length: 160 }).notNull(),
    pickupTime: time("pickup_time"),
    dropTime: time("drop_time"),
    sequence: integer("sequence").notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    feeOverridePaise: bigint("fee_override_paise", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    routeSequenceUnique: uniqueIndex("route_stops_route_sequence_unique").on(table.routeId, table.sequence),
    routeStopIdx: index("route_stops_route_idx").on(table.tenantId, table.routeId),
  }),
);

export const studentTransportAllocations = pgTable(
  "student_transport_allocations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id").references(() => academicYears.id, { onDelete: "set null" }),
    routeId: uuid("route_id").notNull().references(() => vehicleRoutes.id, { onDelete: "restrict" }),
    pickupStopId: uuid("pickup_stop_id").references(() => routeStops.id, { onDelete: "set null" }),
    dropStopId: uuid("drop_stop_id").references(() => routeStops.id, { onDelete: "set null" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    monthlyFeePaise: bigint("monthly_fee_paise", { mode: "number" }).notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    activeStudentYearUnique: uniqueIndex("student_transport_active_student_year_unique").on(table.tenantId, table.studentId, table.academicYearId).where(sql`status = 'active'`),
    studentIdx: index("student_transport_student_idx").on(table.tenantId, table.studentId),
    routeIdx: index("student_transport_route_idx").on(table.tenantId, table.routeId),
  }),
);

export const vehicleMaintenanceRecords = pgTable(
  "vehicle_maintenance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
    maintenanceType: varchar("maintenance_type", { length: 60 }).notNull(),
    serviceDate: date("service_date").notNull(),
    odometerKm: integer("odometer_km"),
    vendorName: varchar("vendor_name", { length: 160 }),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull().default(0),
    nextDueDate: date("next_due_date"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    vehicleDateIdx: index("vehicle_maintenance_vehicle_date_idx").on(table.tenantId, table.vehicleId, table.serviceDate),
  }),
);

export const vehicleTrackingEvents = pgTable(
  "vehicle_tracking_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    externalVehicleId: varchar("external_vehicle_id", { length: 100 }).notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    speed: integer("speed"),
    heading: integer("heading"),
    ignitionOn: boolean("ignition_on"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    vehicleRecordedIdx: index("vehicle_tracking_vehicle_recorded_idx").on(table.tenantId, table.externalVehicleId, table.recordedAt),
    latestIdx: index("vehicle_tracking_latest_idx").on(table.tenantId, table.vehicleId, table.recordedAt),
  }),
);

export const messageCampaigns = pgTable(
  "message_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    channel: varchar("channel", { length: 40 }).notNull(),
    audience: varchar("audience", { length: 120 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    sentCount: integer("sent_count").notNull().default(0),
    deliveredCount: integer("delivered_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantStatusIdx: index("message_campaigns_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
  }),
);

// --- Wave 3: facilities & mobile config ---

export const libraryBooks = pgTable(
  "library_books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    accession: varchar("accession", { length: 60 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    author: varchar("author", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("available"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantAccessionUnique: uniqueIndex("library_books_tenant_accession_unique").on(
      table.tenantId,
      table.accession,
    ),
    tenantStatusIdx: index("library_books_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
  }),
);

export const libraryTitles = pgTable(
  "library_titles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    author: varchar("author", { length: 255 }),
    publisher: varchar("publisher", { length: 160 }),
    isbn: varchar("isbn", { length: 32 }),
    edition: varchar("edition", { length: 80 }),
    language: varchar("language", { length: 60 }),
    subject: varchar("subject", { length: 120 }),
    classification: varchar("classification", { length: 80 }),
    legacyGroupKey: varchar("legacy_group_key", { length: 512 }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    description: text("description"),
    coverUrl: text("cover_url"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIsbnUnique: uniqueIndex("library_titles_tenant_isbn_unique").on(table.tenantId, table.isbn),
    tenantLegacyGroupUnique: uniqueIndex("library_titles_tenant_legacy_group_unique").on(table.tenantId, table.legacyGroupKey),
    searchIdx: index("library_titles_search_idx").on(table.tenantId, table.title, table.author),
  }),
);

export const libraryCopies = pgTable(
  "library_copies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    titleId: uuid("title_id").notNull().references(() => libraryTitles.id, { onDelete: "cascade" }),
    legacyBookId: uuid("legacy_book_id").references(() => libraryBooks.id, { onDelete: "set null" }),
    accession: varchar("accession", { length: 60 }).notNull(),
    barcode: varchar("barcode", { length: 80 }),
    location: varchar("location", { length: 120 }),
    shelf: varchar("shelf", { length: 80 }),
    acquisitionDate: date("acquisition_date"),
    purchasePricePaise: bigint("purchase_price_paise", { mode: "number" }).notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("available"),
    condition: varchar("condition", { length: 30 }).notNull().default("good"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantAccessionUnique: uniqueIndex("library_copies_tenant_accession_unique").on(table.tenantId, table.accession),
    legacyBookUnique: uniqueIndex("library_copies_legacy_book_unique").on(table.legacyBookId),
    titleIdx: index("library_copies_title_idx").on(table.tenantId, table.titleId, table.status),
  }),
);

export const libraryMembers = pgTable(
  "library_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    memberCode: varchar("member_code", { length: 60 }).notNull(),
    memberType: varchar("member_type", { length: 20 }).notNull(),
    studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id").references(() => staffProfiles.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    blockedReason: text("blocked_reason"),
    maxActiveIssues: integer("max_active_issues").notNull().default(3),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("library_members_tenant_code_unique").on(table.tenantId, table.memberCode),
    studentUnique: uniqueIndex("library_members_student_unique").on(table.tenantId, table.studentId),
    staffUnique: uniqueIndex("library_members_staff_unique").on(table.tenantId, table.staffId),
    statusIdx: index("library_members_status_idx").on(table.tenantId, table.status),
  }),
);

export const librarySettings = pgTable(
  "library_settings",
  {
    tenantId: uuid("tenant_id").primaryKey().references(() => tenants.id, { onDelete: "cascade" }),
    defaultLoanDays: integer("default_loan_days").notNull().default(14),
    maxRenewals: integer("max_renewals").notNull().default(1),
    finePerDayPaise: bigint("fine_per_day_paise", { mode: "number" }).notNull().default(500),
    studentMaxIssues: integer("student_max_issues").notNull().default(3),
    staffMaxIssues: integer("staff_max_issues").notNull().default(6),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const libraryIssues = pgTable(
  "library_issues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    copyId: uuid("copy_id").notNull().references(() => libraryCopies.id, { onDelete: "restrict" }),
    memberId: uuid("member_id").notNull().references(() => libraryMembers.id, { onDelete: "restrict" }),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    dueDate: date("due_date").notNull(),
    returnedAt: timestamp("returned_at", { withTimezone: true }),
    renewCount: integer("renew_count").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("issued"),
    finePaise: bigint("fine_paise", { mode: "number" }).notNull().default(0),
    issuedBy: uuid("issued_by").references(() => users.id, { onDelete: "set null" }),
    returnedBy: uuid("returned_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    activeCopyUnique: uniqueIndex("library_issues_active_copy_unique").on(table.copyId).where(sql`status in ('issued','overdue')`),
    memberIdx: index("library_issues_member_idx").on(table.tenantId, table.memberId, table.status),
    dueIdx: index("library_issues_due_idx").on(table.tenantId, table.dueDate, table.status),
  }),
);

export const libraryFines = pgTable(
  "library_fines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    issueId: uuid("issue_id").notNull().references(() => libraryIssues.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => libraryMembers.id, { onDelete: "cascade" }),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    paidPaise: bigint("paid_paise", { mode: "number" }).notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    reason: varchar("reason", { length: 160 }).notNull().default("overdue"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    issueUnique: uniqueIndex("library_fines_issue_unique").on(table.issueId),
    memberIdx: index("library_fines_member_idx").on(table.tenantId, table.memberId, table.status),
  }),
);

export const libraryAcquisitions = pgTable(
  "library_acquisitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    vendorName: varchar("vendor_name", { length: 160 }),
    orderNumber: varchar("order_number", { length: 80 }),
    orderDate: date("order_date"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    totalPaise: bigint("total_paise", { mode: "number" }).notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantOrderUnique: uniqueIndex("library_acquisitions_tenant_order_unique").on(table.tenantId, table.orderNumber),
    statusIdx: index("library_acquisitions_status_idx").on(table.tenantId, table.status),
  }),
);

export const libraryAcquisitionItems = pgTable(
  "library_acquisition_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    acquisitionId: uuid("acquisition_id").notNull().references(() => libraryAcquisitions.id, { onDelete: "cascade" }),
    titleId: uuid("title_id").references(() => libraryTitles.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    author: varchar("author", { length: 255 }),
    isbn: varchar("isbn", { length: 32 }),
    quantity: integer("quantity").notNull(),
    unitPricePaise: bigint("unit_price_paise", { mode: "number" }).notNull().default(0),
    receivedQuantity: integer("received_quantity").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    acquisitionIdx: index("library_acquisition_items_acquisition_idx").on(table.tenantId, table.acquisitionId),
  }),
);

export const laboratories = pgTable(
  "laboratories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    labType: varchar("lab_type", { length: 60 }).notNull().default("science"),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "set null" }),
    capacity: integer("capacity").notNull().default(0),
    inChargeStaffId: uuid("in_charge_staff_id").references(() => staffProfiles.id, { onDelete: "set null" }),
    safetyInstructions: text("safety_instructions"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCodeUnique: uniqueIndex("laboratories_tenant_code_unique").on(table.tenantId, table.code),
    statusIdx: index("laboratories_status_idx").on(table.tenantId, table.status),
  }),
);

export const labBookings = pgTable(
  "lab_bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    labName: varchar("lab_name", { length: 120 }).notNull(),
    laboratoryId: uuid("laboratory_id").references(() => laboratories.id, { onDelete: "set null" }),
    session: varchar("session", { length: 80 }).notNull(),
    topic: varchar("topic", { length: 160 }),
    classLabel: varchar("class_label", { length: 80 }),
    sectionId: uuid("section_id").references(() => classSections.id, { onDelete: "set null" }),
    periodId: uuid("period_id").references(() => timetablePeriods.id, { onDelete: "set null" }),
    bookingDate: date("booking_date"),
    teacherStaffId: uuid("teacher_staff_id").references(() => staffProfiles.id, { onDelete: "set null" }),
    inCharge: varchar("in_charge", { length: 255 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: uuid("cancelled_by").references(() => users.id, { onDelete: "set null" }),
    cancellationReason: text("cancellation_reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantScheduledIdx: index("lab_bookings_tenant_scheduled_idx").on(
      table.tenantId,
      table.scheduledAt,
    ),
    labPeriodUnique: uniqueIndex("lab_bookings_lab_period_unique").on(table.tenantId, table.laboratoryId, table.bookingDate, table.periodId).where(sql`status <> 'cancelled' and laboratory_id is not null and booking_date is not null and period_id is not null`),
    sectionPeriodUnique: uniqueIndex("lab_bookings_section_period_unique").on(table.tenantId, table.sectionId, table.bookingDate, table.periodId).where(sql`status <> 'cancelled' and section_id is not null and booking_date is not null and period_id is not null`),
  }),
);

export const labEquipment = pgTable(
  "lab_equipment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    laboratoryId: uuid("laboratory_id").notNull().references(() => laboratories.id, { onDelete: "cascade" }),
    assetCode: varchar("asset_code", { length: 60 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    category: varchar("category", { length: 80 }),
    quantity: integer("quantity").notNull().default(1),
    workingQuantity: integer("working_quantity").notNull().default(1),
    condition: varchar("condition", { length: 30 }).notNull().default("good"),
    purchaseDate: date("purchase_date"),
    purchasePricePaise: bigint("purchase_price_paise", { mode: "number" }).notNull().default(0),
    lastMaintenanceDate: date("last_maintenance_date"),
    nextMaintenanceDate: date("next_maintenance_date"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantAssetUnique: uniqueIndex("lab_equipment_tenant_asset_unique").on(table.tenantId, table.assetCode),
    labIdx: index("lab_equipment_lab_idx").on(table.tenantId, table.laboratoryId, table.status),
  }),
);

export const labConsumables = pgTable(
  "lab_consumables",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    laboratoryId: uuid("laboratory_id").notNull().references(() => laboratories.id, { onDelete: "cascade" }),
    itemCode: varchar("item_code", { length: 60 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    unit: varchar("unit", { length: 30 }).notNull().default("unit"),
    quantityOnHand: numeric("quantity_on_hand", { precision: 12, scale: 2 }).notNull().default("0"),
    reorderLevel: numeric("reorder_level", { precision: 12, scale: 2 }).notNull().default("0"),
    unitCostPaise: bigint("unit_cost_paise", { mode: "number" }).notNull().default(0),
    hazardClass: varchar("hazard_class", { length: 80 }),
    expiryDate: date("expiry_date"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantItemUnique: uniqueIndex("lab_consumables_tenant_item_unique").on(table.tenantId, table.itemCode),
    labIdx: index("lab_consumables_lab_idx").on(table.tenantId, table.laboratoryId, table.status),
  }),
);

export const labSafetyIncidents = pgTable(
  "lab_safety_incidents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    laboratoryId: uuid("laboratory_id").notNull().references(() => laboratories.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id").references(() => labBookings.id, { onDelete: "set null" }),
    incidentDate: date("incident_date").notNull(),
    severity: varchar("severity", { length: 20 }).notNull().default("low"),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    actionTaken: text("action_taken"),
    reportedBy: uuid("reported_by").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    labDateIdx: index("lab_safety_incidents_lab_date_idx").on(table.tenantId, table.laboratoryId, table.incidentDate),
  }),
);

export const mobileFeatureFlags = pgTable(
  "mobile_feature_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 80 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    enabled: boolean("enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantKeyUnique: uniqueIndex("mobile_feature_flags_tenant_key_unique").on(
      table.tenantId,
      table.key,
    ),
  }),
);

// --- Phase 3: identity, Student 360, HR baseline, and imports ---

export type StudentNoteCategory =
  | "general"
  | "academic"
  | "behavioural"
  | "medical"
  | "welfare"
  | "safeguarding";
export type StudentNoteVisibility = "staff" | "admin_only" | "restricted";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type GuardianRelationship =
  | "father"
  | "mother"
  | "grandfather"
  | "grandmother"
  | "uncle"
  | "aunt"
  | "sibling"
  | "legal_guardian"
  | "other";
export type ImportJobStatus =
  | "pending"
  | "validating"
  | "valid"
  | "invalid"
  | "importing"
  | "complete"
  | "failed";
export type ImportRowStatus = "valid" | "invalid" | "imported" | "skipped";

export const studentStatusHistory = pgTable(
  "student_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    fromStatus: varchar("from_status", { length: 30 }),
    toStatus: varchar("to_status", { length: 30 }).notNull(),
    reason: text("reason").notNull(),
    effectiveDate: date("effective_date").notNull(),
    changedBy: uuid("changed_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    studentChangedIdx: index("student_status_history_student_idx").on(
      table.tenantId,
      table.studentId,
      table.changedAt,
    ),
  }),
);

export const studentNotes = pgTable(
  "student_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    category: varchar("category", { length: 30 }).$type<StudentNoteCategory>().notNull().default("general"),
    visibility: varchar("visibility", { length: 30 }).$type<StudentNoteVisibility>().notNull().default("staff"),
    createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    studentCreatedIdx: index("student_notes_student_idx").on(
      table.tenantId,
      table.studentId,
      table.createdAt,
    ),
  }),
);

export const studentDocuments = pgTable(
  "student_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    documentType: varchar("document_type", { length: 80 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    fileUrl: varchar("file_url", { length: 2048 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
    mimeType: varchar("mime_type", { length: 120 }),
    verificationStatus: varchar("verification_status", { length: 20 })
      .$type<VerificationStatus>()
      .notNull()
      .default("pending"),
    verificationNote: text("verification_note"),
    verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    uploadedBy: uuid("uploaded_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    studentIdx: index("student_documents_student_idx").on(table.tenantId, table.studentId),
  }),
);

export const guardianProfiles = pgTable(
  "guardian_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }),
    phonePrimary: varchar("phone_primary", { length: 20 }),
    phoneSecondary: varchar("phone_secondary", { length: 20 }),
    gender: varchar("gender", { length: 20 }),
    occupation: varchar("occupation", { length: 120 }),
    employer: varchar("employer", { length: 255 }),
    annualIncome: varchar("annual_income", { length: 80 }),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pincode: varchar("pincode", { length: 20 }),
    idType: varchar("id_type", { length: 40 }),
    idNumberHash: varchar("id_number_hash", { length: 255 }),
    photoUrl: varchar("photo_url", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("guardian_profiles_user_idx").on(table.userId),
    tenantPhoneIdx: index("guardian_profiles_phone_idx").on(table.tenantId, table.phonePrimary),
  }),
);

export const studentGuardians = pgTable(
  "student_guardians",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    guardianId: uuid("guardian_id").notNull().references(() => guardianProfiles.id, { onDelete: "cascade" }),
    relationship: varchar("relationship", { length: 30 }).$type<GuardianRelationship>().notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    receivesSms: boolean("receives_sms").notNull().default(true),
    receivesEmail: boolean("receives_email").notNull().default(true),
    receivesReports: boolean("receives_reports").notNull().default(true),
    canPickup: boolean("can_pickup").notNull().default(true),
    portalAccess: boolean("portal_access").notNull().default(false),
    verified: boolean("verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    studentGuardianUnique: uniqueIndex("student_guardian_unique_idx").on(
      table.tenantId,
      table.studentId,
      table.guardianId,
    ),
    studentIdx: index("student_guardians_student_idx").on(table.tenantId, table.studentId),
    guardianIdx: index("student_guardians_guardian_idx").on(table.tenantId, table.guardianId),
    primaryGuardianUnique: uniqueIndex("student_guardians_primary_unique")
      .on(table.tenantId, table.studentId)
      .where(sql`${table.isPrimary} = true`),
  }),
);

export const customRoles = pgTable(
  "custom_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    baseRole: varchar("base_role", { length: 30 }).$type<UserRole>().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantNameUnique: uniqueIndex("custom_roles_tenant_name_unique").on(table.tenantId, table.name),
  }),
);

export const customRoleGrants = pgTable(
  "custom_role_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => customRoles.id, { onDelete: "cascade" }),
    permission: varchar("permission", { length: 100 }).$type<Permission>().notNull(),
    scope: varchar("scope", { length: 30 }),
    effect: varchar("effect", { length: 10 }).$type<"allow" | "deny">().notNull().default("allow"),
    grantedBy: uuid("granted_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    rolePermissionScopeUnique: uniqueIndex("custom_role_grants_role_permission_scope_unique").on(
      table.roleId,
      table.permission,
      table.scope,
    ),
    tenantRoleIdx: index("custom_role_grants_tenant_role_idx").on(table.tenantId, table.roleId),
  }),
);

export const staffQualifications = pgTable(
  "staff_qualifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id").notNull().references(() => staffProfiles.id, { onDelete: "cascade" }),
    degree: varchar("degree", { length: 160 }).notNull(),
    institution: varchar("institution", { length: 255 }).notNull(),
    boardOrUniversity: varchar("board_or_university", { length: 255 }),
    yearOfPassing: varchar("year_of_passing", { length: 20 }),
    gradeOrPercentage: varchar("grade_or_percentage", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    staffIdx: index("staff_qualifications_staff_idx").on(table.tenantId, table.staffId),
  }),
);

export const dataImportJobs = pgTable(
  "data_import_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 40 }).$type<"students" | "staff" | "guardians">().notNull(),
    status: varchar("status", { length: 20 }).$type<ImportJobStatus>().notNull().default("pending"),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: varchar("file_url", { length: 2048 }).notNull(),
    totalRows: integer("total_rows"),
    validRows: integer("valid_rows"),
    invalidRows: integer("invalid_rows"),
    importedRows: integer("imported_rows"),
    errorFileUrl: varchar("error_file_url", { length: 2048 }),
    startedBy: uuid("started_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    entityCreatedIdx: index("data_import_jobs_entity_idx").on(
      table.tenantId,
      table.entityType,
      table.createdAt,
    ),
  }),
);

export const dataImportRows = pgTable(
  "data_import_rows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    jobId: uuid("job_id").notNull().references(() => dataImportJobs.id, { onDelete: "cascade" }),
    rowNumber: integer("row_number").notNull(),
    status: varchar("status", { length: 20 }).$type<ImportRowStatus>().notNull(),
    rawData: jsonb("raw_data").$type<Record<string, string>>(),
    errors: jsonb("errors").$type<Array<{ field: string; message: string }>>(),
    entityId: uuid("entity_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    jobRowUnique: uniqueIndex("data_import_rows_job_row_unique").on(table.tenantId, table.jobId, table.rowNumber),
    jobStatusIdx: index("data_import_rows_status_idx").on(table.tenantId, table.jobId, table.status),
  }),
);

export const tenantIntegrations = pgTable(
  "tenant_integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    integrationKey: varchar("integration_key", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).$type<"active" | "inactive" | "error">().notNull().default("inactive"),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    apiKeyHash: varchar("api_key_hash", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIntegrationUnique: uniqueIndex("tenant_integrations_tenant_key_unique").on(
      table.tenantId,
      table.integrationKey,
    ),
  }),
);

