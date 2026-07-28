import { notFound } from "next/navigation";
import { ModuleWorkspace } from "@/components/workspace/module-workspace";
import { requirePermission } from "@/lib/auth/guards";
import { findRouteForPath } from "@/lib/navigation/route-registry";

const supportedModules: Record<string, string> = {
  attendance: "attendance",
  timetables: "timetable",
  timetable: "timetable",
  assessments: "exams",
  exams: "exams",
  admissions: "admissions",
  payroll: "payroll",
  transport: "vehicles",
  vehicles: "vehicles",
  communications: "communications",
  library: "library",
  laboratories: "labs",
  labs: "labs",
  "ai-studio": "ai-studio",
  analytics: "intelligence",
  intelligence: "intelligence",
  "digital-experience": "mobile",
  mobile: "mobile",
  administration: "settings",
  "administration/school": "settings",
  settings: "settings",
};

export default async function TenantModulePage({ params }: { params: Promise<{ module: string[] }> }) {
  const { module } = await params;
  const moduleKey = module.join("/");
  const workspaceKey = supportedModules[moduleKey];
  const route = findRouteForPath(`/${moduleKey}`);
  if (!workspaceKey || !route || route.comingSoon) notFound();
  if (route.requiredPermission) {
    await requirePermission(route.requiredPermission);
  }
  return <ModuleWorkspace moduleKey={workspaceKey} />;
}
