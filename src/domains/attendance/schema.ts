import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { tenants, users } from "../identity-tenancy/schema";
import { students, academicYears } from "../academic-core/schema";

// --- ENUMS ---
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
  "ON_LEAVE",
]);

export const attendanceSourceEnum = pgEnum("attendance_source", [
  "MANUAL", // Teacher App
  "BIOMETRIC", // ZKTeco Device
  "SYSTEM", // Auto-generated (e.g., Holidays)
]);

export const deviceStatusEnum = pgEnum("device_status", [
  "ONLINE",
  "OFFLINE",
  "ERROR",
]);

/**
 * ATTENDANCE LOGS
 * The central ledger of daily attendance.
 * PARTITIONING NOTE: In production, this table is partitioned by 'date' range.
 */
export const attendanceLogs = pgTable(
  "attendance_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),
    academicYearId: uuid("academic_year_id")
      .references(() => academicYears.id)
      .notNull(),

    date: timestamp("date").notNull(), // The effective date (normalized to midnight)
    status: attendanceStatusEnum("status").notNull(),

    // Audit & Source
    source: attendanceSourceEnum("source").notNull(),
    markedById: uuid("marked_by_id").references(() => users.id), // Null if Biometric
    deviceId: uuid("device_id"), // Null if Manual

    // Metadata
    checkInTime: timestamp("check_in_time"),
    checkOutTime: timestamp("check_out_time"),
    remarks: text("remarks"),

    // Sync Columns
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantDateIdx: index("idx_attendance_tenant_date").on(
      table.tenantId,
      table.date
    ),
    studentIdx: index("idx_attendance_student").on(table.studentId),
    // Sync optimization: Filter by tenant + updated_at
    syncIdx: index("idx_attendance_sync").on(table.tenantId, table.updatedAt),
  })
);

/**
 * BIOMETRIC DEVICES
 * Registry of IoT devices linked to the tenant.
 */
export const devices = pgTable(
  "devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    serialNumber: text("serial_number").notNull(), // From ZKTeco Firmware
    name: text("name").notNull(), // e.g., "Main Gate Entry"
    location: text("location"),

    ipAddress: text("ip_address"),
    lastHeartbeat: timestamp("last_heartbeat"),
    status: deviceStatusEnum("status").default("OFFLINE").notNull(),

    // Config pushed to device
    config: jsonb("config").default({}),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantIdx: index("idx_devices_tenant").on(table.tenantId),
    serialIdx: index("idx_devices_serial").on(table.serialNumber), // Global lookup for Ingestion Service
  })
);

/**
 * LEAVE APPLICATIONS
 * Formal requests that override default attendance.
 */
export const leaves = pgTable(
  "leaves",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    reason: text("reason"),

    status: text("status").default("PENDING").notNull(), // PENDING, APPROVED, REJECTED
    approvedById: uuid("approved_by_id").references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantStudentIdx: index("idx_leaves_tenant_student").on(
      table.tenantId,
      table.studentId
    ),
  })
);
