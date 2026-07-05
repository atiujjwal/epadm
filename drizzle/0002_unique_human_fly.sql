CREATE TABLE "academic_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(120) NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"homeroom_staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"capacity" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"section_id" uuid,
	"academic_year" varchar(20) NOT NULL,
	"roll_number" varchar(20),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"enrolled_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_homeroom_staff_id_staff_profiles_id_fk" FOREIGN KEY ("homeroom_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_class_id_academic_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."academic_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_class_id_academic_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."academic_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_section_id_class_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."class_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academic_classes_tenant_code_year_unique" ON "academic_classes" USING btree ("tenant_id","code","academic_year");--> statement-breakpoint
CREATE INDEX "academic_classes_tenant_status_idx" ON "academic_classes" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "class_sections_tenant_class_name_unique" ON "class_sections" USING btree ("tenant_id","class_id","name");--> statement-breakpoint
CREATE INDEX "class_sections_tenant_status_idx" ON "class_sections" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "student_enrollments_tenant_student_year_unique" ON "student_enrollments" USING btree ("tenant_id","student_id","academic_year");--> statement-breakpoint
CREATE INDEX "student_enrollments_tenant_class_year_idx" ON "student_enrollments" USING btree ("tenant_id","class_id","academic_year");