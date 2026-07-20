-- Wave 1–3 foundation tables for design parity backend roadmap.
-- Includes CREATE TABLE + ENABLE RLS + tenant_isolation_policy + FORCE RLS.

-- Wave 1
CREATE TABLE IF NOT EXISTS "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"code" varchar(40) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "subjects_tenant_code_unique" ON "subjects" USING btree ("tenant_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subjects_tenant_status_idx" ON "subjects" USING btree ("tenant_id","status");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subjects" ADD CONSTRAINT "subjects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"from_date" date NOT NULL,
	"to_date" date NOT NULL,
	"reason" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_applications_tenant_student_idx" ON "leave_applications" USING btree ("tenant_id","student_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_applications_tenant_status_idx" ON "leave_applications" USING btree ("tenant_id","status");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"date" date NOT NULL,
	"name" varchar(255) NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "holidays_tenant_date_idx" ON "holidays" USING btree ("tenant_id","date");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "holidays" ADD CONSTRAINT "holidays_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Wave 2
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admission_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"applicant_name" varchar(255) NOT NULL,
	"grade" varchar(40) NOT NULL,
	"stage" varchar(60) DEFAULT 'inquiry' NOT NULL,
	"fit_score" integer,
	"owner" varchar(255),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admission_applications_tenant_stage_idx" ON "admission_applications" USING btree ("tenant_id","stage");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admission_applications_tenant_status_idx" ON "admission_applications" USING btree ("tenant_id","status");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timetable_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"period" integer NOT NULL,
	"class_label" varchar(80) NOT NULL,
	"subject" varchar(120) NOT NULL,
	"room" varchar(80),
	"teacher_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timetable_entries_tenant_day_period_idx" ON "timetable_entries" USING btree ("tenant_id","day_of_week","period");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(40) NOT NULL,
	"number_plate" varchar(40) NOT NULL,
	"driver_name" varchar(255),
	"route_name" varchar(120),
	"student_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_tenant_code_unique" ON "vehicles" USING btree ("tenant_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicles_tenant_status_idx" ON "vehicles" USING btree ("tenant_id","status");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"channel" varchar(40) NOT NULL,
	"audience" varchar(120) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_campaigns_tenant_status_idx" ON "message_campaigns" USING btree ("tenant_id","status");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message_campaigns" ADD CONSTRAINT "message_campaigns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Wave 3
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"accession" varchar(60) NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" varchar(255),
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_books_tenant_accession_unique" ON "library_books" USING btree ("tenant_id","accession");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_books_tenant_status_idx" ON "library_books" USING btree ("tenant_id","status");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "library_books" ADD CONSTRAINT "library_books_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"lab_name" varchar(120) NOT NULL,
	"session" varchar(80) NOT NULL,
	"class_label" varchar(80),
	"in_charge" varchar(255),
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_bookings_tenant_scheduled_idx" ON "lab_bookings" USING btree ("tenant_id","scheduled_at");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_bookings" ADD CONSTRAINT "lab_bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key" varchar(80) NOT NULL,
	"label" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "mobile_feature_flags_tenant_key_unique" ON "mobile_feature_flags" USING btree ("tenant_id","key");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_feature_flags" ADD CONSTRAINT "mobile_feature_flags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Row-Level Security (ENABLE + policy + FORCE), matching 0004 / 0010
--> statement-breakpoint
ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "subjects"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "subjects" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "leave_applications" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "leave_applications"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "leave_applications" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "holidays" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "holidays"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "holidays" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "admission_applications" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "admission_applications"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "admission_applications" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "timetable_entries" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "timetable_entries"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "timetable_entries" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "vehicles"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "message_campaigns" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "message_campaigns"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "message_campaigns" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "library_books" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "library_books"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "library_books" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "lab_bookings"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "lab_bookings" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "mobile_feature_flags" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation_policy ON "mobile_feature_flags"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "mobile_feature_flags" FORCE ROW LEVEL SECURITY;
