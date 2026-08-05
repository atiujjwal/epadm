CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "snapshot_key" varchar(120) NOT NULL,
  "academic_year_id" uuid REFERENCES "academic_years"("id") ON DELETE set null,
  "data" jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL DEFAULT now(),
  "valid_until" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "report_key" varchar(120) NOT NULL,
  "report_label" varchar(255) NOT NULL,
  "parameters" jsonb NOT NULL DEFAULT '{}',
  "run_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','running','complete','failed')),
  "row_count" integer,
  "export_url" text,
  "error_message" text,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "report_key" varchar(120) NOT NULL,
  "report_label" varchar(255) NOT NULL,
  "parameters" jsonb NOT NULL DEFAULT '{}',
  "frequency" varchar(20) NOT NULL CHECK ("frequency" IN ('daily','weekly','monthly')),
  "day_of_week" integer CHECK ("day_of_week" IS NULL OR ("day_of_week" >= 0 AND "day_of_week" <= 6)),
  "day_of_month" integer CHECK ("day_of_month" IS NULL OR ("day_of_month" >= 1 AND "day_of_month" <= 28)),
  "run_time" time NOT NULL DEFAULT '07:00',
  "recipients" text[],
  "is_active" boolean NOT NULL DEFAULT true,
  "last_run_at" timestamp with time zone,
  "next_run_at" timestamp with time zone,
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_generations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "feature" varchar(80) NOT NULL,
  "model" varchar(120) NOT NULL,
  "prompt_tokens" integer,
  "output_tokens" integer,
  "input_summary" text NOT NULL,
  "output" text NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft','reviewed','applied','rejected','archived')),
  "reviewed_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "reviewed_at" timestamp with time zone,
  "applied_to_type" varchar(80),
  "applied_to_id" uuid,
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_knowledge_base" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "title" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "category" varchar(40) NOT NULL DEFAULT 'other' CHECK ("category" IN ('school_info','curriculum','policies','exam_pattern','other')),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_settings" (
  "tenant_id" uuid PRIMARY KEY REFERENCES "tenants"("id") ON DELETE cascade,
  "features_enabled" text[],
  "monthly_token_limit" integer NOT NULL DEFAULT 500000,
  "tokens_used_this_month" integer NOT NULL DEFAULT 0,
  "usage_reset_date" date,
  "custom_api_key_hash" text,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "report_card_generations"
  ADD COLUMN IF NOT EXISTS "custom_comment" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "analytics_snapshots_tenant_key_year_unique" ON "analytics_snapshots" ("tenant_id","snapshot_key", COALESCE("academic_year_id", '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX IF NOT EXISTS "analytics_snapshots_tenant_key_year_idx" ON "analytics_snapshots" ("tenant_id","snapshot_key","academic_year_id");
CREATE INDEX IF NOT EXISTS "analytics_snapshots_valid_until_idx" ON "analytics_snapshots" ("tenant_id","valid_until");
CREATE INDEX IF NOT EXISTS "report_runs_tenant_created_idx" ON "report_runs" ("tenant_id","created_at" DESC);
CREATE INDEX IF NOT EXISTS "report_runs_tenant_report_idx" ON "report_runs" ("tenant_id","report_key");
CREATE INDEX IF NOT EXISTS "report_schedules_tenant_active_idx" ON "report_schedules" ("tenant_id","is_active");
CREATE INDEX IF NOT EXISTS "report_schedules_next_run_idx" ON "report_schedules" ("tenant_id","next_run_at");
CREATE INDEX IF NOT EXISTS "ai_generations_feature_idx" ON "ai_generations" ("tenant_id","feature","created_at" DESC);
CREATE INDEX IF NOT EXISTS "ai_generations_status_idx" ON "ai_generations" ("tenant_id","status");
CREATE INDEX IF NOT EXISTS "ai_knowledge_base_category_idx" ON "ai_knowledge_base" ("tenant_id","category","is_active");
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
  ('analytics.read', 'View analytics dashboards and report catalogues.'),
  ('analytics.academic.read', 'View academic analytics dashboards.'),
  ('finance.analytics.read', 'View finance analytics dashboards.'),
  ('hr.analytics.read', 'View HR and payroll analytics dashboards.'),
  ('reports.run', 'Run curated operational reports and download exports.'),
  ('reports.schedule.manage', 'Create and manage scheduled report deliveries.'),
  ('ai-studio.read', 'Use approved AI Studio tools and copilots.'),
  ('ai-studio.use', 'Generate AI-assisted content as logged drafts.'),
  ('ai-studio.governance', 'Review AI generation history and govern outputs.'),
  ('ai-studio.settings', 'Configure AI Studio features and token limits.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role", "permission_code")
SELECT role_name, permission_code
FROM (
  VALUES
    ('superadmin','analytics.academic.read'),('superadmin','finance.analytics.read'),('superadmin','hr.analytics.read'),('superadmin','reports.run'),('superadmin','reports.schedule.manage'),('superadmin','ai-studio.use'),('superadmin','ai-studio.governance'),('superadmin','ai-studio.settings'),
    ('admin','analytics.academic.read'),('admin','finance.analytics.read'),('admin','hr.analytics.read'),('admin','reports.run'),('admin','reports.schedule.manage'),('admin','ai-studio.use'),('admin','ai-studio.governance'),('admin','ai-studio.settings'),
    ('teacher','analytics.read'),('teacher','analytics.academic.read'),('teacher','reports.run'),('teacher','ai-studio.read'),('teacher','ai-studio.use'),
    ('accountant','analytics.read'),('accountant','finance.analytics.read'),('accountant','reports.run'),
    ('hr','analytics.read'),('hr','hr.analytics.read'),('hr','reports.run'),('hr','ai-studio.read'),('hr','ai-studio.use'),
    ('librarian','analytics.read'),('librarian','reports.run')
) AS grants(role_name, permission_code)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'analytics_snapshots',
    'report_runs',
    'report_schedules',
    'ai_generations',
    'ai_knowledge_base',
    'ai_settings'
  ]
  LOOP
    policy_name := table_name || '_tenant_isolation_policy';
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I ON %I USING (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid)',
      policy_name,
      table_name
    );
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epadm_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO epadm_app;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_ops') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epadm_ops;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO epadm_ops;
  END IF;
END $$;
