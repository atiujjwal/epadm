CREATE TABLE "staff_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tenant_user_id" uuid,
	"employee_code" varchar(40) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"department" varchar(120),
	"job_title" varchar(120),
	"employment_type" varchar(40) DEFAULT 'full_time' NOT NULL,
	"joined_on" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"admission_number" varchar(40) NOT NULL,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(120),
	"gender" varchar(20),
	"date_of_birth" date,
	"class_label" varchar(80),
	"section_label" varchar(80),
	"guardian_name" varchar(255),
	"guardian_phone" varchar(20),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_user_id_tenant_users_id_fk" FOREIGN KEY ("tenant_user_id") REFERENCES "public"."tenant_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_profiles_tenant_employee_unique" ON "staff_profiles" USING btree ("tenant_id","employee_code");--> statement-breakpoint
CREATE INDEX "staff_profiles_tenant_status_idx" ON "staff_profiles" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "students_tenant_admission_unique" ON "students" USING btree ("tenant_id","admission_number");--> statement-breakpoint
CREATE INDEX "students_tenant_status_idx" ON "students" USING btree ("tenant_id","status");