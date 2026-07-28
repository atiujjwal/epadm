"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCtx } from "@/lib/context";
import { users } from "@/lib/db";
import { withTenant } from "@/lib/rls";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(255),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phone: z.string().trim().max(20, "Phone number must contain at most 20 characters."),
});

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  errors: string[];
};

export async function updateOwnProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const ctx = await getCtx();
  try {
    await withTenant(ctx.tenantId, (tx) =>
      tx
        .update(users)
        .set({
          ...parsed.data,
          phone: parsed.data.phone || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.userId)),
    );
  } catch {
    return {
      status: "error",
      errors: ["The profile could not be saved. The email or phone may already be in use."],
    };
  }

  revalidatePath("/me/profile");
  return { status: "success", errors: [] };
}
