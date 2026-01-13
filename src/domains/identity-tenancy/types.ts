import { InferSelectModel } from "drizzle-orm";
import { tenants, users, tenantUsers, roles } from "./schema";

// --- ENTITIES ---
export type Tenant = InferSelectModel<typeof tenants>;
export type User = InferSelectModel<typeof users>;
export type Role = InferSelectModel<typeof roles>;
export type TenantUser = InferSelectModel<typeof tenantUsers>;

// --- DTOs ---

export interface CreateTenantInput {
  name: string;
  slug: string;
  subscriptionTier?: "FOUNDATION" | "GROWTH" | "ENTERPRISE";
}

export interface CreateUserInput {
  email: string;
  passwordHash: string; // Hashed by Auth Service before service call
  firstName: string;
  lastName: string;
}

export interface AssignRoleInput {
  tenantId: string;
  userId: string;
  roleId: string;
}

export interface UserContext {
  userId: string;
  tenantId: string;
  permissions: string[];
}
