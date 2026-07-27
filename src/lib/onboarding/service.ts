import "server-only";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  academicYears,
  staffDepartments,
  subjects,
  tenants,
  tenantUsers,
  type OnboardingStatus,
  type UserRole,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import {
  createOnboardingDefaults,
  mergeOnboardingDraft,
  type OnboardingDraft,
} from "./defaults";

const profileSchema = z.object({
  schoolName: z.string().trim().min(2).max(255),
  logoUrl: z.string().trim().max(1024).optional().or(z.literal("")),
  foundationYear: z.string().trim().regex(/^\d{4}$/).optional().or(z.literal("")),
  shortName: z.string().trim().min(1).max(80),
  academicYear: z.string().trim().min(4).max(20),
  academicYearStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const academicsSchema = z.object({
  classes: z.array(z.object({ code: z.string().trim().min(1).max(40), name: z.string().trim().min(1).max(120) })).min(1),
  sections: z.array(z.string().trim().min(1).max(10)).min(1),
  subjects: z.array(z.object({ code: z.string().trim().min(1).max(40), name: z.string().trim().min(1).max(120) })).min(1),
  streams: z.array(z.object({ code: z.string().trim().min(1).max(40), name: z.string().trim().min(1).max(120), grade: z.string().trim().max(40), capacity: z.coerce.number().int().min(1) })),
});

const organizationSchema = z.object({
  departments: z.array(z.object({ code: z.string().trim().max(40).optional().or(z.literal("")), name: z.string().trim().min(2).max(120), description: z.string().trim().max(1000).optional().or(z.literal("")) })),
  roles: z.array(z.string().trim().min(1).max(80)),
  staff: z.array(z.object({ employeeCode: z.string().trim().max(40), fullName: z.string().trim().max(255), email: z.string().trim().email().optional().or(z.literal("")), jobTitle: z.string().trim().max(120), department: z.string().trim().max(120) })),
});

const operationsSchema = z.object({
  library: z.object({ accessionPrefix: z.string().trim().min(1).max(20), lendingDays: z.coerce.number().int().min(1).max(365) }),
  payroll: z.object({ cycle: z.string().trim().min(1).max(40), payoutDay: z.coerce.number().int().min(1).max(31) }),
  houses: z.array(z.object({ name: z.string().trim().min(1).max(80), color: z.string().trim().min(1).max(40) })).min(1),
});

export const onboardingStepSchemas = {
  1: profileSchema,
  2: academicsSchema,
  3: organizationSchema,
  4: operationsSchema,
} as const;

export type OnboardingStep = keyof typeof onboardingStepSchemas;

export function isSuperadminRole(role: UserRole) {
  return role === "superadmin" || role === "admin";
}

export async function getTenantOnboarding(tenantId: string) {
  const [tenant] = await withTenant(tenantId, (tx) =>
    tx
      .select({
        name: tenants.name,
        logoUrl: tenants.logoUrl,
        shortName: tenants.shortName,
        foundationYear: tenants.foundationYear,
        academicYearStart: tenants.academicYearStart,
        onboardingStatus: tenants.onboardingStatus,
        onboardingStep: tenants.onboardingStep,
        onboardingDraft: tenants.onboardingDraft,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1),
  );

  if (!tenant) throw new Error("Tenant not found.");

  const defaults = createOnboardingDefaults({
    schoolName: tenant.name,
    logoUrl: tenant.logoUrl,
    shortName: tenant.shortName,
    foundationYear: tenant.foundationYear,
    academicYearStart: tenant.academicYearStart ? String(tenant.academicYearStart) : null,
  });

  return {
    status: tenant.onboardingStatus as OnboardingStatus,
    step: tenant.onboardingStep,
    draft: mergeOnboardingDraft(defaults, tenant.onboardingDraft),
  };
}

export async function assertOnboardingAccess(input: { tenantId: string; userId: string; role: UserRole }) {
  const [membership] = await withTenant(input.tenantId, (tx) =>
    tx
      .select({ role: tenantUsers.role })
      .from(tenantUsers)
      .where(and(eq(tenantUsers.tenantId, input.tenantId), eq(tenantUsers.userId, input.userId), eq(tenantUsers.isActive, true)))
      .limit(1),
  );

  if (!membership || !isSuperadminRole(membership.role)) {
    throw new Error("Only the tenant superadmin can manage onboarding.");
  }
}

export async function saveOnboardingStep(input: {
  tenantId: string;
  userId: string;
  role: UserRole;
  step: OnboardingStep;
  data: unknown;
  exit?: boolean;
}) {
  await assertOnboardingAccess(input);
  const parsed = onboardingStepSchemas[input.step].parse(input.data);

  return withTenant(input.tenantId, async (tx) => {
    const [tenant] = await tx
      .select({ onboardingDraft: tenants.onboardingDraft })
      .from(tenants)
      .where(eq(tenants.id, input.tenantId))
      .limit(1);

    const defaults = createOnboardingDefaults();
    const draft = mergeOnboardingDraft(defaults, tenant?.onboardingDraft);
    const key = stepToDraftKey(input.step);
    const nextDraft = { ...draft, [key]: parsed };
    const nextStep = input.exit ? input.step : Math.min(input.step + 1, 4);

    if (input.step === 1) {
      const profile = parsed as z.infer<typeof profileSchema>;
      await tx
        .update(tenants)
        .set({
          name: profile.schoolName,
          logoUrl: profile.logoUrl || null,
          shortName: profile.shortName,
          foundationYear: profile.foundationYear ? Number(profile.foundationYear) : null,
          academicYearStart: profile.academicYearStart,
        })
        .where(eq(tenants.id, input.tenantId));

      await tx
        .insert(academicYears)
        .values({
          tenantId: input.tenantId,
          name: profile.academicYear,
          startDate: profile.academicYearStart,
          endDate: addOneYearMinusOneDay(profile.academicYearStart),
          isCurrent: false,
        })
        .onConflictDoNothing();

      await tx
        .update(academicYears)
        .set({ isCurrent: false, updatedAt: new Date() })
        .where(eq(academicYears.tenantId, input.tenantId));

      await tx
        .update(academicYears)
        .set({
          startDate: profile.academicYearStart,
          endDate: addOneYearMinusOneDay(profile.academicYearStart),
          isCurrent: true,
          updatedAt: new Date(),
        })
        .where(and(eq(academicYears.tenantId, input.tenantId), eq(academicYears.name, profile.academicYear)));
    }

    if (input.step === 2) {
      const academics = parsed as z.infer<typeof academicsSchema>;
      for (const subject of academics.subjects) {
        await tx
          .insert(subjects)
          .values({
            tenantId: input.tenantId,
            code: subject.code.trim().toUpperCase(),
            name: subject.name.trim(),
            status: "active",
          })
          .onConflictDoUpdate({
            target: [subjects.tenantId, subjects.code],
            set: { name: subject.name.trim(), status: "active", updatedAt: new Date() },
          });
      }
    }

    if (input.step === 3) {
      const organization = parsed as z.infer<typeof organizationSchema>;
      for (const department of organization.departments) {
        const code = department.code ? department.code.trim().toUpperCase() : null;
        if (!code) continue;
        await tx
          .insert(staffDepartments)
          .values({
            tenantId: input.tenantId,
            code,
            name: department.name.trim(),
            description: department.description || null,
            isSystem: false,
            status: "active",
          })
          .onConflictDoUpdate({
            target: [staffDepartments.tenantId, staffDepartments.code],
            set: {
              name: department.name.trim(),
              description: department.description || null,
              updatedAt: new Date(),
            },
          });
      }
    }

    const [updated] = await tx
      .update(tenants)
      .set({
        onboardingStatus: input.exit ? "IN_PROGRESS" : "IN_PROGRESS",
        onboardingStep: nextStep,
        onboardingDraft: nextDraft,
      })
      .where(eq(tenants.id, input.tenantId))
      .returning({ onboardingStatus: tenants.onboardingStatus, onboardingStep: tenants.onboardingStep });

    return { status: updated.onboardingStatus, step: updated.onboardingStep, draft: nextDraft };
  });
}

export async function completeOnboarding(input: { tenantId: string; userId: string; role: UserRole }) {
  await assertOnboardingAccess(input);

  const [updated] = await withTenant(input.tenantId, (tx) =>
    tx
      .update(tenants)
      .set({ onboardingStatus: "COMPLETED", onboardingStep: 4 })
      .where(eq(tenants.id, input.tenantId))
      .returning({ onboardingStatus: tenants.onboardingStatus, onboardingStep: tenants.onboardingStep }),
  );

  return { status: updated.onboardingStatus, step: updated.onboardingStep };
}

function stepToDraftKey(step: OnboardingStep): keyof OnboardingDraft {
  if (step === 1) return "profile";
  if (step === 2) return "academics";
  if (step === 3) return "organization";
  return "operations";
}

function addOneYearMinusOneDay(startDate: string) {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
