CREATE TABLE "academic_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"display_order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"short_code" varchar(40),
	"address" text,
	"city" varchar(100),
	"phone" varchar(20),
	"email" varchar(255),
	"is_main" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_frameworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"abbreviation" varchar(40),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"is_core" boolean DEFAULT true NOT NULL,
	"periods_per_week" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"campus_id" uuid,
	"name" varchar(120) NOT NULL,
	"room_type" varchar(30) DEFAULT 'classroom' NOT NULL,
	"capacity" integer,
	"floor" varchar(40),
	"building" varchar(120),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_houses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"color" varchar(20),
	"motto" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"offering_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_break" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"offering_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"room_id" uuid,
	"period_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academic_classes" ADD COLUMN "program_name" varchar(80);--> statement-breakpoint
ALTER TABLE "academic_classes" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "academic_classes" ADD COLUMN "curriculum_framework_id" uuid;--> statement-breakpoint
ALTER TABLE "academic_years" ADD COLUMN "status" varchar(20) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "academic_years" ADD COLUMN "campus_id" uuid;--> statement-breakpoint
ALTER TABLE "class_sections" ADD COLUMN "room_id" uuid;--> statement-breakpoint
ALTER TABLE "class_sections" ADD COLUMN "house_id" uuid;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "academic_year_id" uuid;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "enrollment_status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "completion_date" date;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "promotion_basis" varchar(40);--> statement-breakpoint
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_frameworks" ADD CONSTRAINT "curriculum_frameworks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_offerings" ADD CONSTRAINT "curriculum_offerings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_offerings" ADD CONSTRAINT "curriculum_offerings_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_offerings" ADD CONSTRAINT "curriculum_offerings_class_id_academic_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."academic_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_offerings" ADD CONSTRAINT "curriculum_offerings_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_houses" ADD CONSTRAINT "school_houses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_allocations" ADD CONSTRAINT "teacher_allocations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_allocations" ADD CONSTRAINT "teacher_allocations_offering_id_curriculum_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."curriculum_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_allocations" ADD CONSTRAINT "teacher_allocations_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_allocations" ADD CONSTRAINT "teacher_allocations_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_periods" ADD CONSTRAINT "timetable_periods_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_version_id_timetable_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."timetable_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_offering_id_curriculum_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."curriculum_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_period_id_timetable_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."timetable_periods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_versions" ADD CONSTRAINT "timetable_versions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_versions" ADD CONSTRAINT "timetable_versions_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_versions" ADD CONSTRAINT "timetable_versions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_versions" ADD CONSTRAINT "timetable_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academic_terms_year_name_unique" ON "academic_terms" USING btree ("academic_year_id","name");--> statement-breakpoint
CREATE INDEX "academic_terms_year_idx" ON "academic_terms" USING btree ("academic_year_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "campuses_tenant_name_unique" ON "campuses" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "campuses_one_main_per_tenant" ON "campuses" USING btree ("tenant_id") WHERE "campuses"."is_main" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "curriculum_frameworks_tenant_name_unique" ON "curriculum_frameworks" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "curriculum_offerings_year_class_subject_unique" ON "curriculum_offerings" USING btree ("academic_year_id","class_id","subject_id");--> statement-breakpoint
CREATE INDEX "curriculum_offerings_class_idx" ON "curriculum_offerings" USING btree ("academic_year_id","class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_tenant_name_unique" ON "rooms" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "rooms_tenant_campus_idx" ON "rooms" USING btree ("tenant_id","campus_id");--> statement-breakpoint
CREATE UNIQUE INDEX "school_houses_tenant_name_unique" ON "school_houses" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_allocations_offering_section_staff_unique" ON "teacher_allocations" USING btree ("offering_id","section_id","staff_id");--> statement-breakpoint
CREATE INDEX "teacher_allocations_staff_idx" ON "teacher_allocations" USING btree ("staff_id","offering_id");--> statement-breakpoint
CREATE INDEX "teacher_allocations_section_idx" ON "teacher_allocations" USING btree ("section_id");--> statement-breakpoint
CREATE UNIQUE INDEX "timetable_periods_tenant_name_unique" ON "timetable_periods" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "timetable_slots_version_section_period_day_unique" ON "timetable_slots" USING btree ("version_id","section_id","period_id","day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "timetable_slots_version_staff_period_day_unique" ON "timetable_slots" USING btree ("version_id","staff_id","period_id","day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "timetable_slots_version_room_period_day_unique" ON "timetable_slots" USING btree ("version_id","room_id","period_id","day_of_week");--> statement-breakpoint
CREATE INDEX "timetable_slots_version_section_idx" ON "timetable_slots" USING btree ("version_id","section_id","day_of_week");--> statement-breakpoint
CREATE INDEX "timetable_slots_version_staff_idx" ON "timetable_slots" USING btree ("version_id","staff_id","day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "timetable_versions_year_name_unique" ON "timetable_versions" USING btree ("academic_year_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "timetable_versions_one_published_per_year" ON "timetable_versions" USING btree ("tenant_id","academic_year_id") WHERE "timetable_versions"."status" = 'published';--> statement-breakpoint
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_curriculum_framework_id_curriculum_frameworks_id_fk" FOREIGN KEY ("curriculum_framework_id") REFERENCES "public"."curriculum_frameworks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_house_id_school_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."school_houses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
UPDATE "student_enrollments" se
SET "academic_year_id" = ay."id"
FROM "academic_years" ay
WHERE se."tenant_id" = ay."tenant_id"
  AND se."academic_year" = ay."name"
  AND se."academic_year_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_status_check" CHECK ("status" IN ('draft','active','archived'));
--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_check" CHECK ("room_type" IN ('classroom','lab','hall','gym','library','office','other'));
--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_enrollment_status_check" CHECK ("enrollment_status" IN ('active','completed','transferred','withdrawn','promoted'));
--> statement-breakpoint
ALTER TABLE "timetable_versions" ADD CONSTRAINT "timetable_versions_status_check" CHECK ("status" IN ('draft','published','archived'));
--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_day_of_week_check" CHECK ("day_of_week" BETWEEN 0 AND 6);
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
	('academics.progression.read', 'Preview academic progression and enrollment rollover.'),
	('curriculum.write', 'Create and manage curriculum frameworks, offerings, and allocations.'),
	('timetables.edit', 'Create timetable versions and manage draft slots.'),
	('timetables.settings.update', 'Configure working days and timetable period definitions.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
DO $$
DECLARE
	table_name text;
BEGIN
	FOREACH table_name IN ARRAY ARRAY[
		'academic_terms', 'campuses', 'rooms', 'school_houses',
		'curriculum_frameworks', 'curriculum_offerings', 'teacher_allocations',
		'timetable_periods', 'timetable_versions', 'timetable_slots'
	]
	LOOP
		EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
		EXECUTE format(
			'CREATE POLICY %I ON %I USING (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid)',
			table_name || '_tenant_isolation_policy', table_name
		);
		EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
	END LOOP;
END $$;
