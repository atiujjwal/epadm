CREATE TABLE IF NOT EXISTS "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" varchar(20) NOT NULL,
	"notes" text,
	"marked_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" date NOT NULL,
	"file_path" varchar(1024),
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_class_id_academic_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."academic_classes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_marked_by_id_users_id_fk" FOREIGN KEY ("marked_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_academic_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."academic_classes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "assignments" ADD CONSTRAINT "assignments_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "tenant_student_date_unique" ON "attendance" USING btree ("tenant_id","student_id","date");

-- Enable Row-Level Security on these tables
ALTER TABLE "attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignments" ENABLE ROW LEVEL SECURITY;

-- Create isolation policies
CREATE POLICY tenant_isolation_policy ON "attendance"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "assignments"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- Add tenant_user_id column to students table
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "tenant_user_id" uuid;

DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_tenant_user_id_tenant_users_id_fk" FOREIGN KEY ("tenant_user_id") REFERENCES "public"."tenant_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
