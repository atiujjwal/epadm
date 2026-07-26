import { notFound } from "next/navigation";
import { ModuleWorkspace } from "@/components/workspace/module-workspace";

const supportedModules = new Set(["attendance", "timetable", "exams", "admissions", "payroll", "vehicles", "communications", "library", "labs", "ai-studio", "intelligence", "mobile", "settings"]);

export default async function TenantModulePage({ params }: { params: Promise<{ module: string[] }> }) {
  const { module } = await params;
  const moduleKey = module.join("/");
  if (!supportedModules.has(moduleKey)) notFound();
  return <ModuleWorkspace moduleKey={moduleKey} />;
}
