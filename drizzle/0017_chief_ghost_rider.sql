-- EPADM Phase 3: Administration, Identity, Student 360, HR and data imports.
-- This migration is intentionally additive. Academic-year and onboarding objects
-- were introduced by hand-written migrations 0013-0016 and must not be recreated.

CREATE TABLE "custom_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"name" varchar(120) NOT NULL,
	"description" text,
	"base_role" varchar(30) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "custom_roles_base_role_check" CHECK ("base_role" IN ('admin','teacher','student','parent','staff','accountant','librarian','hr'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "custom_roles_tenant_name_unique" ON "custom_roles" ("tenant_id", "name");
--> statement-breakpoint

CREATE TABLE "custom_role_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"role_id" uuid NOT NULL REFERENCES "custom_roles"("id") ON DELETE cascade,
	"permission" varchar(100) NOT NULL,
	"scope" varchar(30),
	"effect" varchar(10) DEFAULT 'allow' NOT NULL,
	"granted_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "custom_role_grants_effect_check" CHECK ("effect" IN ('allow','deny'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "custom_role_grants_role_permission_scope_unique" ON "custom_role_grants" ("role_id", "permission", "scope") NULLS NOT DISTINCT;
--> statement-breakpoint
CREATE INDEX "custom_role_grants_tenant_role_idx" ON "custom_role_grants" ("tenant_id", "role_id");
--> statement-breakpoint

CREATE TABLE "data_import_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"entity_type" varchar(40) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" varchar(2048) NOT NULL,
	"total_rows" integer,
	"valid_rows" integer,
	"invalid_rows" integer,
	"imported_rows" integer,
	"error_file_url" varchar(2048),
	"started_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "data_import_jobs_entity_type_check" CHECK ("entity_type" IN ('students','staff','guardians')),
	CONSTRAINT "data_import_jobs_status_check" CHECK ("status" IN ('pending','validating','valid','invalid','importing','complete','failed')),
	CONSTRAINT "data_import_jobs_counts_check" CHECK (COALESCE("total_rows",0) >= 0 AND COALESCE("valid_rows",0) >= 0 AND COALESCE("invalid_rows",0) >= 0 AND COALESCE("imported_rows",0) >= 0)
);
--> statement-breakpoint
CREATE INDEX "data_import_jobs_entity_idx" ON "data_import_jobs" ("tenant_id", "entity_type", "created_at");
--> statement-breakpoint

CREATE TABLE "data_import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"job_id" uuid NOT NULL REFERENCES "data_import_jobs"("id") ON DELETE cascade,
	"row_number" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"raw_data" jsonb,
	"errors" jsonb,
	"entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "data_import_rows_status_check" CHECK ("status" IN ('valid','invalid','imported','skipped')),
	CONSTRAINT "data_import_rows_row_number_check" CHECK ("row_number" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "data_import_rows_job_row_unique" ON "data_import_rows" ("tenant_id", "job_id", "row_number");
--> statement-breakpoint
CREATE INDEX "data_import_rows_status_idx" ON "data_import_rows" ("tenant_id", "job_id", "status");
--> statement-breakpoint

CREATE TABLE "guardian_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"user_id" uuid REFERENCES "users"("id") ON DELETE set null,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(120) NOT NULL,
	"email" varchar(255),
	"phone_primary" varchar(20),
	"phone_secondary" varchar(20),
	"gender" varchar(20),
	"occupation" varchar(120),
	"employer" varchar(255),
	"annual_income" varchar(80),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(20),
	"id_type" varchar(40),
	"id_number_hash" varchar(255),
	"photo_url" varchar(1024),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guardian_profiles_gender_check" CHECK ("gender" IS NULL OR "gender" IN ('male','female','other','prefer_not_to_say'))
);
--> statement-breakpoint
CREATE INDEX "guardian_profiles_user_idx" ON "guardian_profiles" ("user_id");
--> statement-breakpoint
CREATE INDEX "guardian_profiles_phone_idx" ON "guardian_profiles" ("tenant_id", "phone_primary");
--> statement-breakpoint

CREATE TABLE "staff_qualifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id") ON DELETE cascade,
	"degree" varchar(160) NOT NULL,
	"institution" varchar(255) NOT NULL,
	"board_or_university" varchar(255),
	"year_of_passing" varchar(20),
	"grade_or_percentage" varchar(40),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "staff_qualifications_staff_idx" ON "staff_qualifications" ("tenant_id", "staff_id");
--> statement-breakpoint

CREATE TABLE "student_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
	"document_type" varchar(80) NOT NULL,
	"label" varchar(255) NOT NULL,
	"file_url" varchar(2048) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size_bytes" bigint,
	"mime_type" varchar(120),
	"verification_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"verification_note" text,
	"verified_by" uuid REFERENCES "users"("id") ON DELETE set null,
	"verified_at" timestamp with time zone,
	"uploaded_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_documents_status_check" CHECK ("verification_status" IN ('pending','verified','rejected')),
	CONSTRAINT "student_documents_size_check" CHECK ("file_size_bytes" IS NULL OR "file_size_bytes" >= 0)
);
--> statement-breakpoint
CREATE INDEX "student_documents_student_idx" ON "student_documents" ("tenant_id", "student_id");
--> statement-breakpoint

CREATE TABLE "student_guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
	"guardian_id" uuid NOT NULL REFERENCES "guardian_profiles"("id") ON DELETE cascade,
	"relationship" varchar(30) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"receives_sms" boolean DEFAULT true NOT NULL,
	"receives_email" boolean DEFAULT true NOT NULL,
	"receives_reports" boolean DEFAULT true NOT NULL,
	"can_pickup" boolean DEFAULT true NOT NULL,
	"portal_access" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" uuid REFERENCES "users"("id") ON DELETE set null,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_guardians_relationship_check" CHECK ("relationship" IN ('father','mother','grandfather','grandmother','uncle','aunt','sibling','legal_guardian','other'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "student_guardian_unique_idx" ON "student_guardians" ("tenant_id", "student_id", "guardian_id");
--> statement-breakpoint
CREATE INDEX "student_guardians_student_idx" ON "student_guardians" ("tenant_id", "student_id");
--> statement-breakpoint
CREATE INDEX "student_guardians_guardian_idx" ON "student_guardians" ("tenant_id", "guardian_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "student_guardians_primary_unique" ON "student_guardians" ("tenant_id", "student_id") WHERE "is_primary" = true;
--> statement-breakpoint

CREATE TABLE "student_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
	"body" text NOT NULL,
	"category" varchar(30) DEFAULT 'general' NOT NULL,
	"visibility" varchar(30) DEFAULT 'staff' NOT NULL,
	"created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_notes_category_check" CHECK ("category" IN ('general','academic','behavioural','medical','welfare','safeguarding')),
	CONSTRAINT "student_notes_visibility_check" CHECK ("visibility" IN ('staff','admin_only','restricted'))
);
--> statement-breakpoint
CREATE INDEX "student_notes_student_idx" ON "student_notes" ("tenant_id", "student_id", "created_at");
--> statement-breakpoint

CREATE TABLE "student_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
	"from_status" varchar(30),
	"to_status" varchar(30) NOT NULL,
	"reason" text NOT NULL,
	"effective_date" date NOT NULL,
	"changed_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "student_status_history_student_idx" ON "student_status_history" ("tenant_id", "student_id", "changed_at");
--> statement-breakpoint

CREATE TABLE "tenant_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"integration_key" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'inactive' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"api_key_hash" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_integrations_status_check" CHECK ("status" IN ('inactive','active','error'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_integrations_tenant_key_unique" ON "tenant_integrations" ("tenant_id", "integration_key");
--> statement-breakpoint

ALTER TABLE "staff_profiles" ADD COLUMN "gender" varchar(20);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "blood_group" varchar(10);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "nationality" varchar(80) DEFAULT 'Indian';
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "photo_url" varchar(1024);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "phone_primary" varchar(20);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "phone_secondary" varchar(20);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "address_line1" varchar(255);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "address_line2" varchar(255);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "city" varchar(100);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "state" varchar(100);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "pincode" varchar(20);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "emergency_contact_name" varchar(255);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "emergency_contact_phone" varchar(20);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "leaving_date" date;
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "staff_type" varchar(30) DEFAULT 'teaching' NOT NULL;
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "archived_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN "archive_reason" text;
--> statement-breakpoint
UPDATE "staff_profiles" SET "phone_primary" = "phone" WHERE "phone_primary" IS NULL AND "phone" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_gender_check" CHECK ("gender" IS NULL OR "gender" IN ('male','female','other','prefer_not_to_say'));
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_staff_type_check" CHECK ("staff_type" IN ('teaching','non_teaching','administrative'));
--> statement-breakpoint

ALTER TABLE "students" ADD COLUMN "admission_date" date;
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "blood_group" varchar(10);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "nationality" varchar(80) DEFAULT 'Indian';
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "religion" varchar(80);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "category" varchar(80);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "mother_tongue" varchar(80);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "photo_url" varchar(1024);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "address_line1" varchar(255);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "address_line2" varchar(255);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "city" varchar(100);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "state" varchar(100);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "pincode" varchar(20);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "emergency_contact_name" varchar(255);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "emergency_contact_phone" varchar(20);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "archived_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "archive_reason" text;
--> statement-breakpoint

ALTER TABLE "tenant_users" ADD COLUMN "custom_role_id" uuid REFERENCES "custom_roles"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "tenant_users" ADD COLUMN "membership_status" varchar(20) DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "tenant_users" ADD COLUMN "invited_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "tenant_users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
UPDATE "tenant_users" SET "membership_status" = 'deactivated' WHERE "is_active" = false;
--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_membership_status_check" CHECK ("membership_status" IN ('invited','active','suspended','deactivated'));
--> statement-breakpoint

ALTER TABLE "tenants" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;
--> statement-breakpoint

INSERT INTO "permissions" ("code", "description") VALUES
	('students.create', 'Create student records'),
	('students.update', 'Update student records'),
	('students.export', 'Export student records'),
	('students.import', 'Import student records'),
	('students.archive', 'Archive student records'),
	('students.guardians.read', 'View student guardians'),
	('students.guardians.write', 'Manage student guardians'),
	('students.documents.read', 'View student documents'),
	('students.documents.write', 'Manage student documents'),
	('students.documents.verify', 'Verify student documents'),
	('students.notes.read', 'View student notes'),
	('students.notes.create', 'Create student notes'),
	('students.notes.safeguarding', 'Access safeguarding notes'),
	('hr.staff.create', 'Create staff records'),
	('hr.staff.update', 'Update staff records'),
	('hr.staff.export', 'Export staff records'),
	('hr.staff.import', 'Import staff records'),
	('hr.staff.archive', 'Archive staff records'),
	('hr.departments.read', 'View departments'),
	('hr.departments.create', 'Create departments'),
	('hr.departments.update', 'Update departments'),
	('hr.departments.archive', 'Archive departments'),
	('hr.qualifications.manage', 'Manage staff qualifications'),
	('administration.users.create', 'Create tenant users'),
	('administration.users.update', 'Update tenant users'),
	('administration.users.deactivate', 'Deactivate tenant users'),
	('administration.users.reset', 'Reset tenant user credentials'),
	('administration.school.read', 'View school settings'),
	('administration.school.update', 'Update school settings'),
	('administration.roles.read', 'View custom roles'),
	('administration.roles.create', 'Create custom roles'),
	('administration.roles.update', 'Update custom roles'),
	('administration.integrations.read', 'View tenant integrations'),
	('administration.integrations.update', 'Update tenant integrations')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint

DO $$
DECLARE
	table_name text;
BEGIN
	FOREACH table_name IN ARRAY ARRAY[
		'custom_roles', 'custom_role_grants', 'data_import_jobs', 'data_import_rows',
		'guardian_profiles', 'staff_qualifications', 'student_documents',
		'student_guardians', 'student_notes', 'student_status_history', 'tenant_integrations'
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
