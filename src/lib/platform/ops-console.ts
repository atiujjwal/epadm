import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { aiGenerations, aiSettings, opsDb, platformAuditLogs, tenantDailyMetrics, tenants } from "@/lib/db/ops";

export async function getPlatformAiGovernance() {
  const usage = await opsDb
    .select({
      tenantId: aiSettings.tenantId,
      tokensUsedThisMonth: aiSettings.tokensUsedThisMonth,
      monthlyTokenLimit: aiSettings.monthlyTokenLimit,
      tenantName: tenants.name,
      tenantSlug: tenants.slug,
    })
    .from(aiSettings)
    .leftJoin(tenants, eq(tenants.id, aiSettings.tenantId))
    .orderBy(desc(aiSettings.tokensUsedThisMonth))
    .limit(20);

  const [status] = await opsDb.select({
    totalGenerations: sql<number>`count(*)::int`,
    failedGenerations: sql<number>`coalesce(sum(case when ${aiGenerations.status} = 'rejected' then 1 else 0 end), 0)::int`,
    totalTokens: sql<number>`coalesce(sum(coalesce(${aiGenerations.promptTokens}, 0) + coalesce(${aiGenerations.outputTokens}, 0)), 0)::int`,
  }).from(aiGenerations);

  return {
    usage,
    totalGenerations: status?.totalGenerations ?? 0,
    failedGenerations: status?.failedGenerations ?? 0,
    totalTokens: status?.totalTokens ?? 0,
    platformKeyConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY),
  };
}

export async function listPlatformAuditLogs() {
  return opsDb.select().from(platformAuditLogs).orderBy(desc(platformAuditLogs.createdAt)).limit(100);
}

export async function getInfrastructureHealth() {
  const start = performance.now();
  await opsDb.execute(sql`select 1`);
  const latencyMs = Math.round(performance.now() - start);
  const [tenantCount] = await opsDb.select({ count: sql<number>`count(*)::int` }).from(tenants);
  const latestMetrics = await opsDb.select().from(tenantDailyMetrics).orderBy(desc(tenantDailyMetrics.logDate)).limit(10);
  const migrationResult = await opsDb.execute(sql`select hash, created_at from drizzle.__drizzle_migrations order by created_at desc limit 1`);
  const migration = migrationResult.rows[0] ?? null;
  return {
    db: "connected",
    latencyMs,
    tenantCount: tenantCount?.count ?? 0,
    latestMetrics,
    latestMigration: migration ?? null,
    generatedAt: new Date().toISOString(),
  };
}
