CREATE TABLE "academic_years" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "name" varchar(20) NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "is_current" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "academic_years_tenant_name_unique" ON "academic_years" USING btree ("tenant_id","name");
--> statement-breakpoint
CREATE UNIQUE INDEX "academic_years_tenant_current_unique" ON "academic_years" USING btree ("tenant_id") WHERE "is_current" = true;
--> statement-breakpoint
ALTER TABLE "academic_classes" ADD COLUMN "academic_year_id" uuid;
--> statement-breakpoint
ALTER TABLE "academic_classes" ADD COLUMN "class_teacher_id" uuid;
--> statement-breakpoint
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_class_teacher_id_staff_profiles_id_fk" FOREIGN KEY ("class_teacher_id") REFERENCES "public"."staff_profiles"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "academic_classes_tenant_code_year_id_unique" ON "academic_classes" USING btree ("tenant_id","code","academic_year_id");
--> statement-breakpoint
CREATE TABLE "class_teacher_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "class_id" uuid NOT NULL,
  "teacher_id" uuid NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date,
  "changed_by_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_teacher_history" ADD CONSTRAINT "class_teacher_history_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "class_teacher_history" ADD CONSTRAINT "class_teacher_history_class_id_academic_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."academic_classes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "class_teacher_history" ADD CONSTRAINT "class_teacher_history_teacher_id_staff_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."staff_profiles"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "class_teacher_history" ADD CONSTRAINT "class_teacher_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "class_teacher_history_tenant_class_idx" ON "class_teacher_history" USING btree ("tenant_id","class_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "class_teacher_history_active_unique" ON "class_teacher_history" USING btree ("tenant_id","class_id") WHERE "end_date" is null;
--> statement-breakpoint
INSERT INTO "academic_years" ("tenant_id", "name", "start_date", "end_date", "is_current")
SELECT DISTINCT "tenant_id", "academic_year", '2026-04-01'::date, '2027-03-31'::date, true
FROM "academic_classes"
ON CONFLICT ("tenant_id", "name") DO NOTHING;
--> statement-breakpoint
UPDATE "academic_classes"
SET
  "academic_year_id" = "academic_years"."id",
  "class_teacher_id" = "academic_classes"."homeroom_staff_id"
FROM "academic_years"
WHERE
  "academic_classes"."tenant_id" = "academic_years"."tenant_id"
  AND "academic_classes"."academic_year" = "academic_years"."name";
--> statement-breakpoint
UPDATE "academic_classes"
SET
  "class_teacher_id" = (
    SELECT "staff_profiles"."id"
    FROM "staff_profiles"
    INNER JOIN "tenant_users" ON "staff_profiles"."tenant_user_id" = "tenant_users"."id"
    WHERE
      "staff_profiles"."tenant_id" = "academic_classes"."tenant_id"
      AND "staff_profiles"."status" = 'active'
      AND "tenant_users"."tenant_id" = "academic_classes"."tenant_id"
      AND "tenant_users"."role" = 'teacher'
      AND "tenant_users"."is_active" = true
    ORDER BY "staff_profiles"."created_at" ASC
    LIMIT 1
  ),
  "homeroom_staff_id" = (
    SELECT "staff_profiles"."id"
    FROM "staff_profiles"
    INNER JOIN "tenant_users" ON "staff_profiles"."tenant_user_id" = "tenant_users"."id"
    WHERE
      "staff_profiles"."tenant_id" = "academic_classes"."tenant_id"
      AND "staff_profiles"."status" = 'active'
      AND "tenant_users"."tenant_id" = "academic_classes"."tenant_id"
      AND "tenant_users"."role" = 'teacher'
      AND "tenant_users"."is_active" = true
    ORDER BY "staff_profiles"."created_at" ASC
    LIMIT 1
  )
WHERE
  "academic_classes"."class_teacher_id" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "staff_profiles"
    INNER JOIN "tenant_users" ON "staff_profiles"."tenant_user_id" = "tenant_users"."id"
    WHERE
      "staff_profiles"."tenant_id" = "academic_classes"."tenant_id"
      AND "staff_profiles"."status" = 'active'
      AND "tenant_users"."tenant_id" = "academic_classes"."tenant_id"
      AND "tenant_users"."role" = 'teacher'
      AND "tenant_users"."is_active" = true
  );
--> statement-breakpoint
INSERT INTO "class_teacher_history" ("tenant_id", "class_id", "teacher_id", "start_date")
SELECT
  "academic_classes"."tenant_id",
  "academic_classes"."id",
  "academic_classes"."class_teacher_id",
  "academic_years"."start_date"
FROM "academic_classes"
INNER JOIN "academic_years" ON "academic_classes"."academic_year_id" = "academic_years"."id"
WHERE "academic_classes"."class_teacher_id" IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "academic_classes" ALTER COLUMN "academic_year_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_class_teacher_required_check" CHECK ("class_teacher_id" IS NOT NULL) NOT VALID;
--> statement-breakpoint
ALTER TABLE "academic_years" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "academic_years_tenant_isolation_policy" ON "academic_years"
  USING ("tenant_id" = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
  WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "academic_years" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "class_teacher_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "class_teacher_history_tenant_isolation_policy" ON "class_teacher_history"
  USING ("tenant_id" = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
  WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "class_teacher_history" FORCE ROW LEVEL SECURITY;
