ALTER TABLE "tenants" ADD COLUMN "onboarding_status" varchar(20) DEFAULT 'PENDING' NOT NULL;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "onboarding_step" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "foundation_year" integer;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "short_name" varchar(80);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "academic_year_start" date;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "onboarding_draft" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "tenant_users"
SET "role" = 'superadmin'
WHERE "id" IN (
  SELECT DISTINCT ON ("tenant_id") "id"
  FROM "tenant_users"
  WHERE "role" = 'admin'
  ORDER BY "tenant_id", "joined_at" ASC
);
