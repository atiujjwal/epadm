import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * TENANTS (Schools)
 * The root entity for isolation.
 */
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(), // Subdomain
    domain: text("domain"), // Custom domain support

    // Configuration (JSONB for vertical customization)
    settings: jsonb("settings").default({}),
    subscriptionTier: text("subscription_tier").default("FOUNDATION").notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("idx_tenants_slug").on(table.slug),
  })
);

/**
 * USERS (Global Identity)
 * A user exists independently of a tenant.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(), // Argon2id

  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),

  // DPDP Compliance
  isVerified: boolean("is_verified").default(false).notNull(), // Email/Phone verified
  consentVersion: text("consent_version"), // Track agreed TOS version

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete for Right to Erasure
});

/**
 * ROLES
 * Defines a set of permissions. Can be system-defined or custom.
 */
export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id), // Null = System Role
    name: text("name").notNull(), // "Admin", "Teacher", "Parent"
    permissions: jsonb("permissions").notNull(), // ["attendance.write", "grades.read"

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_roles_tenant").on(table.tenantId),
  })
);

/**
 * TENANT USERS (RBAC Link)
 * Assigns a User to a Tenant with a specific Role.
 * CRITICAL: This table is heavily protected by RLS.
 */
export const tenantUsers = pgTable(
  "tenant_users",
  {
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    roleId: uuid("role_id")
      .references(() => roles.id)
      .notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tenantId, table.userId] }), // Composite PK
    tenantIdx: index("idx_tenant_users_tenant").on(table.tenantId),
    userIdx: index("idx_tenant_users_user").on(table.userId),
  })
);
