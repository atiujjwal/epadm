import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { ensureAISettings, listAIGenerations, AI_FEATURES } from "@/lib/phase12/ai-studio";
import { PortalShell, SimpleTable, StatGrid, Status } from "../phase11-view";

export default async function AiStudioPage() {
  const ctx = await requirePermission("ai-studio.read");
  const [settings, generations] = await Promise.all([ensureAISettings(ctx.tenantId), listAIGenerations(ctx.tenantId)]);
  return (
    <PortalShell title="AI Studio" description="Governed AI drafting for exams, lessons, report-card comments, and school communication.">
      <StatGrid stats={[
        { label: "Enabled features", value: settings.featuresEnabled?.length ?? 0 },
        { label: "Monthly token limit", value: settings.monthlyTokenLimit.toLocaleString("en-IN") },
        { label: "Tokens used", value: settings.tokensUsedThisMonth.toLocaleString("en-IN") },
        { label: "Drafts in history", value: generations.filter((item) => item.status === "draft").length },
      ]} />

      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["/ai-studio/exam-generator", "Exam Generator"],
          ["/ai-studio/lesson-planner", "Lesson Planner"],
          ["/ai-studio/report-card-comments", "Report Card Comments"],
          ["/ai-studio/communication-writer", "Communication Writer"],
          ["/ai-studio/governance", "Governance"],
          ["/ai-studio/knowledge-base", "Knowledge Base"],
          ["/ai-studio/settings", "Settings"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-lg border bg-surface p-4 text-sm font-medium hover:bg-muted">{label}</Link>
        ))}
      </div>

      <SimpleTable rows={[...AI_FEATURES]} columns={[
        { label: "Feature", value: (row) => row.label },
        { label: "Status", value: (row) => <Status value={settings.featuresEnabled?.includes(row.key) ? "enabled" : "disabled"} /> },
        { label: "Description", value: (row) => row.description },
      ]} />
    </PortalShell>
  );
}
