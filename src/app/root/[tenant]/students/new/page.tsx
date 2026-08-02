import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/lib/auth/guards";
import { getAcademicPlacementOptions } from "@/lib/phase3/students";
import { StudentCreateForm } from "./student-create-form";
export default async function NewStudentPage(){const ctx=await requirePermission("students.create");const options=await getAcademicPlacementOptions(ctx.tenantId);return <div className="space-y-6"><PageHeader title="Add student" description="Create a canonical student profile and initial placement."/><StudentCreateForm options={options}/></div>}
