ALTER TABLE "staff_profiles" ADD COLUMN "date_of_birth" date;
--> statement-breakpoint
CREATE TABLE "staff_departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "code" varchar(40) NOT NULL,
  "name" varchar(120) NOT NULL,
  "head_staff_id" uuid,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "vacancies" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff_departments" ADD CONSTRAINT "staff_departments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "staff_departments" ADD CONSTRAINT "staff_departments_head_staff_id_staff_profiles_id_fk" FOREIGN KEY ("head_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "staff_departments_tenant_code_unique" ON "staff_departments" USING btree ("tenant_id","code");
--> statement-breakpoint
CREATE INDEX "staff_departments_tenant_status_idx" ON "staff_departments" USING btree ("tenant_id","status");
--> statement-breakpoint
INSERT INTO "staff_departments" ("tenant_id", "code", "name")
SELECT
  "tenant_id",
  upper(regexp_replace(left("department", 36), '[^A-Za-z0-9]+', '-', 'g')),
  "department"
FROM (
  SELECT DISTINCT "tenant_id", trim("department") AS "department"
  FROM "staff_profiles"
  WHERE "department" IS NOT NULL AND trim("department") <> ''
) source
ON CONFLICT ("tenant_id", "code") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "staff_departments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "staff_departments_tenant_isolation_policy" ON "staff_departments"
  USING ("tenant_id" = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
  WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "staff_departments" FORCE ROW LEVEL SECURITY;
