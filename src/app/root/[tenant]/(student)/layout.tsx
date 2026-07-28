import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/guards";

type Props = {
  children: ReactNode;
};

export default async function StudentLayout({ children }: Props) {
  await requireRole(["student"]);
  return children;
}
