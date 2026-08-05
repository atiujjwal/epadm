CREATE TABLE IF NOT EXISTS "platform"."tenant_entitlements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "entitlement" varchar(120) NOT NULL,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "enabled_at" timestamp with time zone,
  "note" text,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform"."support_impersonation_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "operator_id" uuid REFERENCES "platform"."operators"("id") ON DELETE set null,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "target_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "reason" text NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active' CHECK ("status" IN ('active','ended','expired')),
  "token_hash" varchar(128) NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "ended_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "privacy_erasure_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "requested_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "reason" text NOT NULL,
  "status" varchar(30) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','exported','approved','applied','rejected')),
  "export_url" text,
  "applied_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "applied_at" timestamp with time zone,
  "rejection_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tenant_entitlements_tenant_key_unique" ON "platform"."tenant_entitlements" ("tenant_id","entitlement");
CREATE INDEX IF NOT EXISTS "tenant_entitlements_enabled_idx" ON "platform"."tenant_entitlements" ("tenant_id","is_enabled");
CREATE UNIQUE INDEX IF NOT EXISTS "support_impersonation_token_hash_unique" ON "platform"."support_impersonation_sessions" ("token_hash");
CREATE INDEX IF NOT EXISTS "support_impersonation_tenant_status_idx" ON "platform"."support_impersonation_sessions" ("tenant_id","status");
CREATE INDEX IF NOT EXISTS "privacy_erasure_requests_tenant_status_idx" ON "privacy_erasure_requests" ("tenant_id","status");
CREATE INDEX IF NOT EXISTS "privacy_erasure_requests_student_idx" ON "privacy_erasure_requests" ("tenant_id","student_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_attendance_student_date" ON "attendance" ("student_id","date");
CREATE INDEX IF NOT EXISTS "idx_attendance_section_date" ON "attendance" ("section_id","date");
CREATE INDEX IF NOT EXISTS "idx_student_results_plan_student_published" ON "student_results" ("plan_id","student_id","is_published");
CREATE INDEX IF NOT EXISTS "idx_notifications_queue_pending_scheduled" ON "notifications_queue" ("tenant_id","scheduled_at") WHERE "status" = 'pending';
CREATE INDEX IF NOT EXISTS "idx_ai_generations_tenant_created" ON "ai_generations" ("tenant_id","created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_report_runs_tenant_status_created" ON "report_runs" ("tenant_id","status","created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_financial_transactions_invoice" ON "financial_transactions" ("invoice_id");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_invoice_status" ON "payment_transactions" ("invoice_id","status");
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
  ('administration.privacy.manage', 'Manage student data exports, retention, and erasure requests.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role", "permission_code")
SELECT role_name, permission_code
FROM (VALUES
  ('superadmin','administration.privacy.manage'),
  ('admin','administration.privacy.manage')
) AS grants(role_name, permission_code)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
DO $$
DECLARE
  policy_name text := 'privacy_erasure_requests_tenant_isolation_policy';
BEGIN
  ALTER TABLE "privacy_erasure_requests" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "privacy_erasure_requests_tenant_isolation_policy" ON "privacy_erasure_requests";
  EXECUTE format(
    'CREATE POLICY %I ON %I USING (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid)',
    policy_name,
    'privacy_erasure_requests'
  );
  ALTER TABLE "privacy_erasure_requests" FORCE ROW LEVEL SECURITY;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "privacy_erasure_requests" TO epadm_app;
    GRANT SELECT, INSERT ON "audit_logs" TO epadm_app;
    REVOKE UPDATE, DELETE ON "audit_logs" FROM epadm_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO epadm_app;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_ops') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epadm_ops;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA platform TO epadm_ops;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO epadm_ops;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA platform TO epadm_ops;
  END IF;
END $$;
