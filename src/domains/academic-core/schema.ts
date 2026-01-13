import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants, users } from "../identity-tenancy/schema"; // Cross-domain reference

/**
 * ACADEMIC YEARS
 * Defines the operational context (e.g., "2025-2026").
 */
export const academicYears = pgTable(
  "academic_years",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    name: text("name").notNull(), // "2025-2026"
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),

    // Status flags
    isActive: boolean("is_active").default(true).notNull(), // Can this year accept data?
    isCurrent: boolean("is_current").default(false).notNull(), // Is this the default year for UI?

    // Sync & Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => {
    return {
      tenantIdx: index("idx_academic_years_tenant").on(
        table.tenantId,
        table.isCurrent
      ),
    };
  }
);

/**
 * CLASSES (Standards)
 * e.g., "Class 10" - Contextualized to an Academic Year
 */
export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    // Relationship: Classes belong to a specific year
    academicYearId: uuid("academic_year_id")
      .references(() => academicYears.id)
      .notNull(),

    name: text("name").notNull(),
    order: integer("order").default(0).notNull(), // Integer for efficient sorting

    // Configuration (e.g., Grading Scale)
    config: jsonb("config"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => {
    return {
      tenantIdx: index("idx_classes_tenant").on(
        table.tenantId,
        table.academicYearId
      ),
    };
  }
);

/**
 * SECTIONS (Divisions)
 * e.g., "Section A"
 */
export const sections = pgTable(
  "sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    classId: uuid("class_id")
      .references(() => classes.id)
      .notNull(),
    name: text("name").notNull(),

    // Link to Staff (User ID)
    classTeacherId: uuid("class_teacher_id").references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => {
    return {
      tenantIdx: index("idx_sections_tenant").on(table.tenantId, table.classId),
    };
  }
);

/**
 * SUBJECTS
 * e.g., "Mathematics", "Physics"
 */
export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    name: text("name").notNull(),
    code: text("code"), // "MAT101"

    // Academic details (Required by Services)
    type: text("type").default("THEORY").notNull(), // 'THEORY', 'PRACTICAL', 'BOTH'
    credits: integer("credits").default(0),

    // Sync & Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => {
    return {
      tenantIdx: index("idx_subjects_tenant").on(table.tenantId),
    };
  }
);

/**
 * STUDENTS
 * The central entity.
 */
export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    // Identity
    admissionNumber: text("admission_number").notNull(),
    rollNumber: text("roll_number"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),

    // Placement
    sectionId: uuid("section_id")
      .references(() => sections.id)
      .notNull(),
    academicYearId: uuid("academic_year_id")
      .references(() => academicYears.id)
      .notNull(),

    // Parent Link (Source [31]: Foundation tier has read-only parent app)
    parentId: uuid("parent_id").references(() => users.id),

    // Vertical Customization
    attributes: jsonb("attributes"),

    // Demographics
    gender: text("gender"),
    dob: timestamp("dob"),
    isActive: boolean("is_active").default(true).notNull(),

    // Sync Meta
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => {
    return {
      // RLS Optimized Index
      tenantNameIdx: index("idx_students_tenant_name").on(
        table.tenantId,
        table.lastName,
        table.firstName
      ),
      tenantAdmissionIdx: index("idx_students_tenant_admission").on(
        table.tenantId,
        table.admissionNumber
      ),
      // Sync Index
      syncIdx: index("idx_students_sync").on(table.tenantId, table.updatedAt),
    };
  }
);
