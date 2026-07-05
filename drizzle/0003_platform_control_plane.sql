CREATE SCHEMA IF NOT EXISTS "platform";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform"."operators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"totp_secret" varchar(512),
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_operators_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform"."tenant_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"service_key" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_service_unique" UNIQUE("tenant_id","service_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform"."tenant_daily_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"log_date" date DEFAULT CURRENT_DATE NOT NULL,
	"active_users" integer DEFAULT 0 NOT NULL,
	"db_storage_bytes" bigint DEFAULT 0 NOT NULL,
	"total_ai_tokens" integer DEFAULT 0 NOT NULL,
	"compute_cost_inr" numeric(10, 4) DEFAULT '0.0000' NOT NULL,
	CONSTRAINT "tenant_date_unique" UNIQUE("tenant_id","log_date")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metrics_date_tenant" ON "platform"."tenant_daily_metrics" USING btree ("log_date","tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform"."platform_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator_id" uuid,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(80) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(64),
	"user_agent" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_audit_logs_action_idx" ON "platform"."platform_audit_logs" USING btree ("action");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_audit_logs_entity_idx" ON "platform"."platform_audit_logs" USING btree ("entity_type","entity_id");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform"."tenant_services" ADD CONSTRAINT "tenant_services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform"."tenant_daily_metrics" ADD CONSTRAINT "tenant_daily_metrics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform"."platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "platform"."operators"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
