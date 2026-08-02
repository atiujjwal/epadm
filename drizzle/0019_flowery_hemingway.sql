CREATE TABLE "assessment_plan_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"assessment_type_id" uuid NOT NULL,
	"weight_percent" numeric(5, 2) NOT NULL,
	"max_marks" numeric(6, 2) NOT NULL,
	"is_gradebook_source" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"term_id" uuid,
	"name" varchar(180) NOT NULL,
	"applies_to_class" uuid,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"max_marks" numeric(6, 2) DEFAULT '100.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"code" varchar(40) NOT NULL,
	"category" varchar(30) DEFAULT 'exam' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"assessment_type_id" uuid NOT NULL,
	"offering_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"exam_date" date NOT NULL,
	"start_time" time,
	"duration_minutes" integer,
	"room_id" uuid,
	"invigilator_id" uuid,
	"max_marks" numeric(6, 2) NOT NULL,
	"passing_marks" numeric(6, 2),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"marks_finalized" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_marks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"exam_event_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"marks_obtained" numeric(6, 2),
	"is_absent" boolean DEFAULT false NOT NULL,
	"is_exempt" boolean DEFAULT false NOT NULL,
	"remarks" text,
	"entered_by" uuid,
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade_scale_bands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"scale_id" uuid NOT NULL,
	"grade_label" varchar(30) NOT NULL,
	"min_percent" numeric(5, 2) NOT NULL,
	"max_percent" numeric(5, 2) NOT NULL,
	"grade_point" numeric(4, 2),
	"remark" text,
	"is_pass" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade_scales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gradebook_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"term_id" uuid,
	"offering_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"max_marks" numeric(6, 2) DEFAULT '100.00' NOT NULL,
	"assessment_type_id" uuid,
	"due_date" date,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gradebook_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"column_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"marks_obtained" numeric(6, 2),
	"is_absent" boolean DEFAULT false NOT NULL,
	"is_exempt" boolean DEFAULT false NOT NULL,
	"remarks" text,
	"entered_by" uuid,
	"entered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_card_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"template_id" uuid,
	"section_id" uuid NOT NULL,
	"pdf_url" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"generated_by" uuid NOT NULL,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_card_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"plan_id" uuid,
	"is_default" boolean DEFAULT false NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"term_id" uuid,
	"plan_id" uuid NOT NULL,
	"offering_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"total_marks_obtained" numeric(6, 2),
	"total_marks_max" numeric(6, 2),
	"percentage" numeric(5, 2),
	"grade_label" varchar(30),
	"grade_point" numeric(4, 2),
	"is_pass" boolean,
	"class_rank" integer,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "assessment_plan_components" ADD CONSTRAINT "assessment_plan_components_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_plan_components" ADD CONSTRAINT "assessment_plan_components_plan_id_assessment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."assessment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_plan_components" ADD CONSTRAINT "assessment_plan_components_assessment_type_id_assessment_types_id_fk" FOREIGN KEY ("assessment_type_id") REFERENCES "public"."assessment_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_plans" ADD CONSTRAINT "assessment_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_plans" ADD CONSTRAINT "assessment_plans_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_plans" ADD CONSTRAINT "assessment_plans_term_id_academic_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."academic_terms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_plans" ADD CONSTRAINT "assessment_plans_applies_to_class_academic_classes_id_fk" FOREIGN KEY ("applies_to_class") REFERENCES "public"."academic_classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_types" ADD CONSTRAINT "assessment_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_plan_id_assessment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."assessment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_assessment_type_id_assessment_types_id_fk" FOREIGN KEY ("assessment_type_id") REFERENCES "public"."assessment_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_offering_id_curriculum_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."curriculum_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_invigilator_id_staff_profiles_id_fk" FOREIGN KEY ("invigilator_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_exam_event_id_exam_events_id_fk" FOREIGN KEY ("exam_event_id") REFERENCES "public"."exam_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_entered_by_users_id_fk" FOREIGN KEY ("entered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_scale_bands" ADD CONSTRAINT "grade_scale_bands_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_scale_bands" ADD CONSTRAINT "grade_scale_bands_scale_id_grade_scales_id_fk" FOREIGN KEY ("scale_id") REFERENCES "public"."grade_scales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_scales" ADD CONSTRAINT "grade_scales_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_columns" ADD CONSTRAINT "gradebook_columns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_columns" ADD CONSTRAINT "gradebook_columns_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_columns" ADD CONSTRAINT "gradebook_columns_term_id_academic_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."academic_terms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_columns" ADD CONSTRAINT "gradebook_columns_offering_id_curriculum_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."curriculum_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_columns" ADD CONSTRAINT "gradebook_columns_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_columns" ADD CONSTRAINT "gradebook_columns_assessment_type_id_assessment_types_id_fk" FOREIGN KEY ("assessment_type_id") REFERENCES "public"."assessment_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_columns" ADD CONSTRAINT "gradebook_columns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_entries" ADD CONSTRAINT "gradebook_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_entries" ADD CONSTRAINT "gradebook_entries_column_id_gradebook_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."gradebook_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_entries" ADD CONSTRAINT "gradebook_entries_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gradebook_entries" ADD CONSTRAINT "gradebook_entries_entered_by_users_id_fk" FOREIGN KEY ("entered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_generations" ADD CONSTRAINT "report_card_generations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_generations" ADD CONSTRAINT "report_card_generations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_generations" ADD CONSTRAINT "report_card_generations_plan_id_assessment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."assessment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_generations" ADD CONSTRAINT "report_card_generations_template_id_report_card_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."report_card_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_generations" ADD CONSTRAINT "report_card_generations_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_generations" ADD CONSTRAINT "report_card_generations_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_templates" ADD CONSTRAINT "report_card_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_templates" ADD CONSTRAINT "report_card_templates_plan_id_assessment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."assessment_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_term_id_academic_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."academic_terms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_plan_id_assessment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."assessment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_offering_id_curriculum_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."curriculum_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_plan_components_plan_type_unique" ON "assessment_plan_components" USING btree ("plan_id","assessment_type_id");--> statement-breakpoint
CREATE INDEX "assessment_plans_year_idx" ON "assessment_plans" USING btree ("academic_year_id","term_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_plans_one_active_class_scope" ON "assessment_plans" USING btree ("tenant_id","academic_year_id","term_id","applies_to_class") WHERE "assessment_plans"."status" = 'active' and "assessment_plans"."applies_to_class" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_plans_one_active_all_scope" ON "assessment_plans" USING btree ("tenant_id","academic_year_id","term_id") WHERE "assessment_plans"."status" = 'active' and "assessment_plans"."applies_to_class" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_types_tenant_code_unique" ON "assessment_types" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_events_type_offering_section_date_unique" ON "exam_events" USING btree ("assessment_type_id","offering_id","section_id","exam_date");--> statement-breakpoint
CREATE INDEX "exam_events_date_idx" ON "exam_events" USING btree ("tenant_id","academic_year_id","exam_date");--> statement-breakpoint
CREATE INDEX "exam_events_section_idx" ON "exam_events" USING btree ("section_id","academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_marks_event_student_unique" ON "exam_marks" USING btree ("exam_event_id","student_id");--> statement-breakpoint
CREATE INDEX "exam_marks_event_idx" ON "exam_marks" USING btree ("exam_event_id");--> statement-breakpoint
CREATE INDEX "exam_marks_student_idx" ON "exam_marks" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grade_scale_bands_scale_label_unique" ON "grade_scale_bands" USING btree ("scale_id","grade_label");--> statement-breakpoint
CREATE UNIQUE INDEX "grade_scales_tenant_name_unique" ON "grade_scales" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "grade_scales_one_default_per_tenant" ON "grade_scales" USING btree ("tenant_id") WHERE "grade_scales"."is_default" = true;--> statement-breakpoint
CREATE INDEX "gradebook_columns_tenant_section_idx" ON "gradebook_columns" USING btree ("tenant_id","section_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gradebook_columns_offering_section_title_unique" ON "gradebook_columns" USING btree ("offering_id","section_id","title");--> statement-breakpoint
CREATE UNIQUE INDEX "gradebook_entries_column_student_unique" ON "gradebook_entries" USING btree ("column_id","student_id");--> statement-breakpoint
CREATE INDEX "gradebook_entries_student_idx" ON "gradebook_entries" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "report_card_generations_student_plan_unique" ON "report_card_generations" USING btree ("student_id","plan_id");--> statement-breakpoint
CREATE INDEX "report_card_generations_plan_section_idx" ON "report_card_generations" USING btree ("plan_id","section_id");--> statement-breakpoint
CREATE UNIQUE INDEX "report_card_templates_one_default_per_tenant" ON "report_card_templates" USING btree ("tenant_id") WHERE "report_card_templates"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "student_results_student_plan_offering_unique" ON "student_results" USING btree ("student_id","plan_id","offering_id");--> statement-breakpoint
CREATE INDEX "student_results_plan_section_idx" ON "student_results" USING btree ("plan_id","section_id");--> statement-breakpoint
CREATE INDEX "student_results_student_idx" ON "student_results" USING btree ("student_id","academic_year_id");
--> statement-breakpoint
ALTER TABLE "assessment_types" ADD CONSTRAINT "assessment_types_category_check" CHECK ("category" IN ('exam','project','practical','oral','portfolio','gradebook','other'));
--> statement-breakpoint
ALTER TABLE "assessment_plans" ADD CONSTRAINT "assessment_plans_status_check" CHECK ("status" IN ('draft','active','archived'));
--> statement-breakpoint
ALTER TABLE "assessment_plan_components" ADD CONSTRAINT "assessment_plan_components_weight_check" CHECK ("weight_percent" > 0 AND "weight_percent" <= 100);
--> statement-breakpoint
ALTER TABLE "assessment_plan_components" ADD CONSTRAINT "assessment_plan_components_max_marks_check" CHECK ("max_marks" > 0);
--> statement-breakpoint
ALTER TABLE "grade_scale_bands" ADD CONSTRAINT "grade_scale_bands_percent_check" CHECK ("min_percent" >= 0 AND "max_percent" <= 100 AND "min_percent" <= "max_percent");
--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_status_check" CHECK ("status" IN ('scheduled','ongoing','completed','cancelled','marks_entered'));
--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_marks_check" CHECK ("max_marks" > 0 AND ("passing_marks" IS NULL OR "passing_marks" <= "max_marks"));
--> statement-breakpoint
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_state_check" CHECK (("marks_obtained" IS NULL OR "marks_obtained" >= 0) AND NOT ("is_absent" = true AND "is_exempt" = true));
--> statement-breakpoint
ALTER TABLE "gradebook_entries" ADD CONSTRAINT "gradebook_entries_state_check" CHECK (("marks_obtained" IS NULL OR "marks_obtained" >= 0) AND NOT ("is_absent" = true AND "is_exempt" = true));
--> statement-breakpoint
ALTER TABLE "report_card_generations" ADD CONSTRAINT "report_card_generations_status_check" CHECK ("status" IN ('pending','generating','complete','failed'));
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
	('assessments.plans.read', 'View assessment plans and components.'),
	('assessments.plans.write', 'Create and manage assessment plans.'),
	('assessments.schedule.read', 'View exam schedules.'),
	('assessments.schedule.write', 'Create and manage exam events.'),
	('assessments.marks.read', 'View assessment marks.'),
	('assessments.marks.write', 'Enter and update assessment marks.'),
	('assessments.marks.finalize', 'Finalize assessment marks.'),
	('assessments.results.read', 'View computed assessment results.'),
	('assessments.results.compute', 'Compute assessment results.'),
	('assessments.results.publish', 'Publish assessment results.'),
	('assessments.report-cards.read', 'View report card generations.'),
	('assessments.report-cards.manage', 'Manage report card templates.'),
	('assessments.report-cards.generate', 'Generate report cards.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
DO $$
DECLARE
	table_name text;
BEGIN
	FOREACH table_name IN ARRAY ARRAY[
		'assessment_types', 'assessment_plans', 'assessment_plan_components',
		'grade_scales', 'grade_scale_bands',
		'gradebook_columns', 'gradebook_entries',
		'exam_events', 'exam_marks', 'student_results',
		'report_card_templates', 'report_card_generations'
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
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_ops') THEN
		GRANT USAGE ON SCHEMA platform TO epadm_ops;
		GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA platform TO epadm_ops;
		GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA platform TO epadm_ops;
		ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO epadm_ops;
		ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT USAGE, SELECT ON SEQUENCES TO epadm_ops;
	END IF;
END $$;
