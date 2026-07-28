import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/guards";

type Props = {
  children: ReactNode;
};

export default async function TeacherLayout({ children }: Props) {
  await requireRole(["teacher"]);
  return children;
}
