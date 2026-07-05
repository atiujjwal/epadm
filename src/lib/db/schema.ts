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
    subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default("basic"),
    subscriptionExpiresAt: timestamp("subscription_expires_at", {
      withTimezone: true,
    }),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      slugIdx: uniqueIndex("tenants_slug_unique").on(table.slug),
    };
  },
);

export type UserRole =
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "staff"
  | "accountant"
  | "librarian";

export const USER_ROLES = [
  "admin",
  "teacher",
  "student",
  "parent",
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
  | "staff.read"
  | "staff.write"
  | "students.read"
  | "students.write"
  | "attendance.read"
  | "attendance.write"
  | "fees.read"
  | "fees.write"
  | "announcements.read"
  | "announcements.write"
  | "reports.read";

export const PERMISSIONS = [
  "tenant.manage",
  "users.read",
  "users.write",
  "academics.read",
  "academics.write",
  "staff.read",
  "staff.write",
  "students.read",
  "students.write",
  "attendance.read",
  "attendance.write",
  "fees.read",
  "fees.write",
  "announcements.read",
  "announcements.write",
  "reports.read",
] as const satisfies readonly Permission[];

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
    role: varchar("role", { length: 30 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    joinedAt: timestamp("joined_at", { withTimezone: true })
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
    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }),
    gender: varchar("gender", { length: 20 }),
    dateOfBirth: date("date_of_birth"),
    classLabel: varchar("class_label", { length: 80 }),
    sectionLabel: varchar("section_label", { length: 80 }),
    guardianName: varchar("guardian_name", { length: 255 }),
    guardianPhone: varchar("guardian_phone", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    jobTitle: varchar("job_title", { length: 120 }),
    employmentType: varchar("employment_type", { length: 40 })
      .notNull()
      .default("full_time"),
    joinedOn: date("joined_on"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    status: varchar("status", { length: 20 }).notNull().default("active"),
    homeroomStaffId: uuid("homeroom_staff_id").references(() => staffProfiles.id, {
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
      tenantClassUnique: uniqueIndex("academic_classes_tenant_code_year_unique").on(
        table.tenantId,
        table.code,
        table.academicYear,
      ),
      tenantClassStatusIdx: index("academic_classes_tenant_status_idx").on(
        table.tenantId,
        table.status,
      ),
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
    rollNumber: varchar("roll_number", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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

export const feeStructures = pgTable(
  "fee_structures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => academicClasses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    amount: integer("amount").notNull(), // amount in base currency (cents/paise/rupees)
    frequency: varchar("frequency", { length: 20 }).notNull(), // "monthly", "quarterly", "annual"
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
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
  }),
);

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
    title: varchar("title", { length: 255 }).notNull(),
    amount: integer("amount").notNull(),
    dueDate: date("due_date").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "paid", "overdue"
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
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
    description: text("description").notNull(),
    invoiceId: uuid("invoice_id").references(() => studentInvoices.id, { onDelete: "set null" }),
    payrollId: uuid("payroll_id").references(() => staffPayroll.id, { onDelete: "set null" }),
    category: varchar("category", { length: 80 }).notNull(), // "fees", "payroll", "maintenance", etc.
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
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




