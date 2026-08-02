ALTER TABLE "staff_profiles" ADD COLUMN IF NOT EXISTS "department_id" uuid;
--> statement-breakpoint
ALTER TABLE "staff_profiles" DROP CONSTRAINT IF EXISTS "staff_profiles_department_id_staff_departments_id_fk";
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_department_id_staff_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."staff_departments"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
UPDATE "staff_profiles" sp
SET "department_id" = sd."id"
FROM "staff_departments" sd
WHERE sp."department_id" IS NULL
  AND sp."tenant_id" = sd."tenant_id"
  AND sp."department" IS NOT NULL
  AND lower(trim(sp."department")) = lower(trim(sd."name"));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_components" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "name" varchar(160) NOT NULL,
  "code" varchar(40) NOT NULL,
  "component_type" varchar(30) NOT NULL,
  "calc_type" varchar(30) DEFAULT 'fixed' NOT NULL,
  "default_value" numeric(12,4),
  "formula" text,
  "is_taxable" boolean DEFAULT false NOT NULL,
  "is_pf_applicable" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_component_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "component_id" uuid NOT NULL,
  "override_value" numeric(12,4),
  "effective_from" date NOT NULL,
  "effective_to" date,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_settings" (
  "tenant_id" uuid PRIMARY KEY NOT NULL,
  "pf_enabled" boolean DEFAULT true NOT NULL,
  "pf_employee_rate" numeric(5,2) DEFAULT '12.00' NOT NULL,
  "pf_employer_rate" numeric(5,2) DEFAULT '12.00' NOT NULL,
  "esi_enabled" boolean DEFAULT true NOT NULL,
  "esi_employee_rate" numeric(5,2) DEFAULT '0.75' NOT NULL,
  "esi_employer_rate" numeric(5,2) DEFAULT '3.25' NOT NULL,
  "esi_gross_ceiling_paise" bigint DEFAULT 2100000 NOT NULL,
  "pt_enabled" boolean DEFAULT true NOT NULL,
  "pt_state" varchar(20),
  "pt_monthly_paise" bigint DEFAULT 20000 NOT NULL,
  "pt_threshold_paise" bigint DEFAULT 1000000 NOT NULL,
  "standard_working_days" integer DEFAULT 26 NOT NULL,
  "pay_day" integer DEFAULT 1 NOT NULL,
  "currency" varchar(10) DEFAULT 'INR' NOT NULL,
  "absence_deduction_mode" varchar(30) DEFAULT 'gross_prorated' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "academic_year_id" uuid,
  "run_month" integer NOT NULL,
  "run_year" integer NOT NULL,
  "run_label" varchar(160) NOT NULL,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "total_gross_paise" bigint DEFAULT 0 NOT NULL,
  "total_deductions_paise" bigint DEFAULT 0 NOT NULL,
  "total_net_paise" bigint DEFAULT 0 NOT NULL,
  "staff_count" integer DEFAULT 0 NOT NULL,
  "initiated_by" uuid,
  "reviewed_by" uuid,
  "reviewed_at" timestamp with time zone,
  "locked_by" uuid,
  "locked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_run_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "run_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "legacy_payroll_id" uuid,
  "working_days" integer DEFAULT 26 NOT NULL,
  "days_present" integer,
  "days_absent" integer DEFAULT 0 NOT NULL,
  "gross_paise" bigint DEFAULT 0 NOT NULL,
  "basic_paise" bigint DEFAULT 0 NOT NULL,
  "pf_employee_paise" bigint DEFAULT 0 NOT NULL,
  "esi_employee_paise" bigint DEFAULT 0 NOT NULL,
  "professional_tax_paise" bigint DEFAULT 0 NOT NULL,
  "tds_paise" bigint DEFAULT 0 NOT NULL,
  "loan_emi_paise" bigint DEFAULT 0 NOT NULL,
  "other_deductions_paise" bigint DEFAULT 0 NOT NULL,
  "total_deductions_paise" bigint DEFAULT 0 NOT NULL,
  "net_paise" bigint DEFAULT 0 NOT NULL,
  "pf_employer_paise" bigint DEFAULT 0 NOT NULL,
  "esi_employer_paise" bigint DEFAULT 0 NOT NULL,
  "is_on_leave" boolean DEFAULT false NOT NULL,
  "remarks" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_run_entry_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "entry_id" uuid NOT NULL,
  "component_id" uuid,
  "component_code" varchar(40) NOT NULL,
  "component_name" varchar(160) NOT NULL,
  "component_type" varchar(30) NOT NULL,
  "calc_type" varchar(30) NOT NULL,
  "base_value_paise" bigint,
  "rate" numeric(8,4),
  "amount_paise" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payslips" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "entry_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "pdf_url" text,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "generated_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_loans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "loan_type" varchar(40) DEFAULT 'salary_advance' NOT NULL,
  "principal_paise" bigint NOT NULL,
  "outstanding_paise" bigint NOT NULL,
  "emi_paise" bigint NOT NULL,
  "installments_paid" integer DEFAULT 0 NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_contracts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "contract_type" varchar(30) DEFAULT 'permanent' NOT NULL,
  "title" varchar(160) NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date,
  "gross_salary_paise" bigint NOT NULL,
  "basic_salary_paise" bigint NOT NULL,
  "notice_period_days" integer DEFAULT 30 NOT NULL,
  "document_url" text,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "notes" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recruitment_postings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "department_id" uuid,
  "title" varchar(160) NOT NULL,
  "description" text,
  "employment_type" varchar(40) DEFAULT 'full_time' NOT NULL,
  "openings" integer DEFAULT 1 NOT NULL,
  "salary_range_min_paise" bigint,
  "salary_range_max_paise" bigint,
  "status" varchar(20) DEFAULT 'open' NOT NULL,
  "posted_at" timestamp with time zone,
  "closes_on" date,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recruitment_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "posting_id" uuid NOT NULL,
  "candidate_name" varchar(160) NOT NULL,
  "candidate_email" varchar(255),
  "candidate_phone" varchar(40),
  "resume_url" text,
  "current_ctc_paise" bigint,
  "expected_ctc_paise" bigint,
  "stage" varchar(30) DEFAULT 'applied' NOT NULL,
  "source" varchar(80),
  "notes" text,
  "hired_staff_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recruitment_interviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "application_id" uuid NOT NULL,
  "scheduled_at" timestamp with time zone NOT NULL,
  "interviewer_user_id" uuid,
  "status" varchar(20) DEFAULT 'scheduled' NOT NULL,
  "feedback" text,
  "rating" numeric(4,2),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recruitment_offers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "application_id" uuid NOT NULL,
  "offered_role" varchar(160) NOT NULL,
  "offered_ctc_paise" bigint NOT NULL,
  "joining_date" date,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "document_url" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "performance_cycles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "academic_year_id" uuid,
  "name" varchar(160) NOT NULL,
  "review_period_start" date NOT NULL,
  "review_period_end" date NOT NULL,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "performance_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "cycle_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "reviewer_user_id" uuid,
  "status" varchar(30) DEFAULT 'pending_self' NOT NULL,
  "self_assessment" jsonb,
  "reviewer_comments" text,
  "dimension_ratings" jsonb,
  "overall_rating" numeric(4,2),
  "acknowledged_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_leave_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "name" varchar(120) NOT NULL,
  "code" varchar(30) NOT NULL,
  "annual_allowance_days" numeric(6,2) DEFAULT '0.00' NOT NULL,
  "requires_l2" boolean DEFAULT false NOT NULL,
  "l2_threshold_days" numeric(6,2) DEFAULT '5.00' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_leave_balances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "leave_type_id" uuid NOT NULL,
  "academic_year_id" uuid,
  "credited_days" numeric(6,2) DEFAULT '0.00' NOT NULL,
  "used_days" numeric(6,2) DEFAULT '0.00' NOT NULL,
  "balance_days" numeric(6,2) DEFAULT '0.00' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_leave_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "staff_id" uuid NOT NULL,
  "leave_type_id" uuid NOT NULL,
  "from_date" date NOT NULL,
  "to_date" date NOT NULL,
  "days" numeric(6,2) NOT NULL,
  "reason" text,
  "status" varchar(30) DEFAULT 'pending' NOT NULL,
  "requires_l2" boolean DEFAULT false NOT NULL,
  "approver_l1" uuid,
  "approver_l2" uuid,
  "l1_approved_by" uuid,
  "l1_approved_at" timestamp with time zone,
  "l2_approved_by" uuid,
  "l2_approved_at" timestamp with time zone,
  "rejected_by" uuid,
  "rejected_at" timestamp with time zone,
  "rejection_note" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "payroll_components" ADD CONSTRAINT "payroll_components_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "payroll_component_assignments" ADD CONSTRAINT "payroll_component_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_component_assignments" ADD CONSTRAINT "payroll_component_assignments_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_component_assignments" ADD CONSTRAINT "payroll_component_assignments_component_id_payroll_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."payroll_components"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "payroll_settings" ADD CONSTRAINT "payroll_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "payroll_run_entries" ADD CONSTRAINT "payroll_run_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_run_entries" ADD CONSTRAINT "payroll_run_entries_run_id_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."payroll_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_run_entries" ADD CONSTRAINT "payroll_run_entries_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_run_entries" ADD CONSTRAINT "payroll_run_entries_legacy_payroll_id_staff_payroll_id_fk" FOREIGN KEY ("legacy_payroll_id") REFERENCES "public"."staff_payroll"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "payroll_run_entry_lines" ADD CONSTRAINT "payroll_run_entry_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_run_entry_lines" ADD CONSTRAINT "payroll_run_entry_lines_entry_id_payroll_run_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."payroll_run_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll_run_entry_lines" ADD CONSTRAINT "payroll_run_entry_lines_component_id_payroll_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."payroll_components"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "payslips" ADD CONSTRAINT "payslips_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payslips" ADD CONSTRAINT "payslips_entry_id_payroll_run_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."payroll_run_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payslips" ADD CONSTRAINT "payslips_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "staff_loans" ADD CONSTRAINT "staff_loans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_loans" ADD CONSTRAINT "staff_loans_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "staff_contracts" ADD CONSTRAINT "staff_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_contracts" ADD CONSTRAINT "staff_contracts_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_contracts" ADD CONSTRAINT "staff_contracts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "recruitment_postings" ADD CONSTRAINT "recruitment_postings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recruitment_postings" ADD CONSTRAINT "recruitment_postings_department_id_staff_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."staff_departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recruitment_postings" ADD CONSTRAINT "recruitment_postings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "recruitment_applications" ADD CONSTRAINT "recruitment_applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recruitment_applications" ADD CONSTRAINT "recruitment_applications_posting_id_recruitment_postings_id_fk" FOREIGN KEY ("posting_id") REFERENCES "public"."recruitment_postings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recruitment_applications" ADD CONSTRAINT "recruitment_applications_hired_staff_id_staff_profiles_id_fk" FOREIGN KEY ("hired_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "recruitment_interviews" ADD CONSTRAINT "recruitment_interviews_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recruitment_interviews" ADD CONSTRAINT "recruitment_interviews_application_id_recruitment_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."recruitment_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recruitment_interviews" ADD CONSTRAINT "recruitment_interviews_interviewer_user_id_users_id_fk" FOREIGN KEY ("interviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "recruitment_offers" ADD CONSTRAINT "recruitment_offers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recruitment_offers" ADD CONSTRAINT "recruitment_offers_application_id_recruitment_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."recruitment_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recruitment_offers" ADD CONSTRAINT "recruitment_offers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "performance_cycles" ADD CONSTRAINT "performance_cycles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "performance_cycles" ADD CONSTRAINT "performance_cycles_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "performance_cycles" ADD CONSTRAINT "performance_cycles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_cycle_id_performance_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."performance_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "staff_leave_types" ADD CONSTRAINT "staff_leave_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_leave_balances" ADD CONSTRAINT "staff_leave_balances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_leave_balances" ADD CONSTRAINT "staff_leave_balances_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_leave_balances" ADD CONSTRAINT "staff_leave_balances_leave_type_id_staff_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."staff_leave_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_leave_balances" ADD CONSTRAINT "staff_leave_balances_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_leave_type_id_staff_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."staff_leave_types"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_approver_l1_users_id_fk" FOREIGN KEY ("approver_l1") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_approver_l2_users_id_fk" FOREIGN KEY ("approver_l2") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_components_tenant_code_unique" ON "payroll_components" ("tenant_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_components_tenant_order_idx" ON "payroll_components" ("tenant_id","display_order");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_component_assignments_staff_component_from_unique" ON "payroll_component_assignments" ("staff_id","component_id","effective_from");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_component_assignments_staff_idx" ON "payroll_component_assignments" ("tenant_id","staff_id","effective_from");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_runs_tenant_month_year_unique" ON "payroll_runs" ("tenant_id","run_month","run_year");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_runs_month_year_idx" ON "payroll_runs" ("tenant_id","run_year","run_month");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_run_entries_run_staff_unique" ON "payroll_run_entries" ("run_id","staff_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_run_entries_run_idx" ON "payroll_run_entries" ("tenant_id","run_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_run_entries_staff_idx" ON "payroll_run_entries" ("tenant_id","staff_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_run_entry_lines_entry_component_unique" ON "payroll_run_entry_lines" ("entry_id","component_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_run_entry_lines_entry_idx" ON "payroll_run_entry_lines" ("tenant_id","entry_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payslips_entry_unique" ON "payslips" ("entry_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payslips_staff_idx" ON "payslips" ("tenant_id","staff_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_loans_staff_idx" ON "staff_loans" ("tenant_id","staff_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_contracts_staff_idx" ON "staff_contracts" ("tenant_id","staff_id","start_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recruitment_postings_tenant_status_idx" ON "recruitment_postings" ("tenant_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recruitment_applications_posting_stage_idx" ON "recruitment_applications" ("tenant_id","posting_id","stage");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recruitment_interviews_application_idx" ON "recruitment_interviews" ("tenant_id","application_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recruitment_offers_application_unique" ON "recruitment_offers" ("application_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "performance_cycles_tenant_name_unique" ON "performance_cycles" ("tenant_id","name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "performance_reviews_cycle_staff_unique" ON "performance_reviews" ("cycle_id","staff_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "performance_reviews_reviewer_idx" ON "performance_reviews" ("tenant_id","reviewer_user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "staff_leave_types_tenant_code_unique" ON "staff_leave_types" ("tenant_id","code");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "staff_leave_balances_staff_type_year_unique" ON "staff_leave_balances" ("staff_id","leave_type_id","academic_year_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_leave_requests_staff_date_idx" ON "staff_leave_requests" ("tenant_id","staff_id","from_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_leave_requests_approver_idx" ON "staff_leave_requests" ("tenant_id","approver_l1","approver_l2","status");
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
  ('payroll.settings.manage', 'Manage payroll statutory and calendar settings.'),
  ('payroll.components.manage', 'Manage payroll earnings and deduction components.'),
  ('payroll.assignments.manage', 'Assign salary components to staff.'),
  ('payroll.runs.read', 'View payroll runs and entries.'),
  ('payroll.runs.create', 'Create payroll runs.'),
  ('payroll.runs.compute', 'Compute and recompute payroll runs.'),
  ('payroll.runs.review', 'Mark payroll runs reviewed.'),
  ('payroll.runs.lock', 'Lock payroll runs and post payroll expenses.'),
  ('payroll.payslips.generate', 'Generate payroll payslips.'),
  ('payroll.payslips.download', 'Download payroll payslips.'),
  ('payroll.loans.manage', 'Manage staff loans and advances.'),
  ('payroll.statutory.read', 'View payroll statutory summaries.'),
  ('hr.contracts.read', 'View staff contracts.'),
  ('hr.contracts.write', 'Create and update staff contracts.'),
  ('hr.recruitment.read', 'View recruitment pipeline records.'),
  ('hr.recruitment.write', 'Manage recruitment pipeline records.'),
  ('hr.performance.read', 'View performance review cycles.'),
  ('hr.performance.write', 'Manage performance reviews.'),
  ('hr.leave.read', 'View staff leave records.'),
  ('hr.leave.write', 'Create and update staff leave requests.'),
  ('hr.leave.approve', 'Approve or reject staff leave requests.'),
  ('approvals.read', 'View actionable approval requests.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role", "permission_code")
SELECT role_name, permission_code
FROM (
  VALUES
    ('superadmin','payroll.settings.manage'),('superadmin','payroll.components.manage'),('superadmin','payroll.assignments.manage'),('superadmin','payroll.runs.read'),('superadmin','payroll.runs.create'),('superadmin','payroll.runs.compute'),('superadmin','payroll.runs.review'),('superadmin','payroll.runs.lock'),('superadmin','payroll.payslips.generate'),('superadmin','payroll.payslips.download'),('superadmin','payroll.loans.manage'),('superadmin','payroll.statutory.read'),('superadmin','hr.contracts.read'),('superadmin','hr.contracts.write'),('superadmin','hr.recruitment.read'),('superadmin','hr.recruitment.write'),('superadmin','hr.performance.read'),('superadmin','hr.performance.write'),('superadmin','hr.leave.read'),('superadmin','hr.leave.write'),('superadmin','hr.leave.approve'),('superadmin','approvals.read'),
    ('admin','payroll.settings.manage'),('admin','payroll.components.manage'),('admin','payroll.assignments.manage'),('admin','payroll.runs.read'),('admin','payroll.runs.create'),('admin','payroll.runs.compute'),('admin','payroll.runs.review'),('admin','payroll.runs.lock'),('admin','payroll.payslips.generate'),('admin','payroll.payslips.download'),('admin','payroll.loans.manage'),('admin','payroll.statutory.read'),('admin','hr.contracts.read'),('admin','hr.contracts.write'),('admin','hr.recruitment.read'),('admin','hr.recruitment.write'),('admin','hr.performance.read'),('admin','hr.performance.write'),('admin','hr.leave.read'),('admin','hr.leave.write'),('admin','hr.leave.approve'),('admin','approvals.read'),
    ('hr','payroll.settings.manage'),('hr','payroll.components.manage'),('hr','payroll.assignments.manage'),('hr','payroll.runs.read'),('hr','payroll.runs.create'),('hr','payroll.runs.compute'),('hr','payroll.payslips.generate'),('hr','payroll.payslips.download'),('hr','payroll.loans.manage'),('hr','payroll.statutory.read'),('hr','hr.contracts.read'),('hr','hr.contracts.write'),('hr','hr.recruitment.read'),('hr','hr.recruitment.write'),('hr','hr.performance.read'),('hr','hr.performance.write'),('hr','hr.leave.read'),('hr','hr.leave.write'),('hr','hr.leave.approve'),('hr','approvals.read'),
    ('accountant','payroll.runs.read'),('accountant','payroll.runs.compute'),('accountant','payroll.runs.review'),('accountant','payroll.runs.lock'),('accountant','payroll.payslips.generate'),('accountant','payroll.payslips.download'),('accountant','payroll.statutory.read'),('accountant','approvals.read'),
    ('staff','payroll.payslips.download'),('staff','hr.leave.read'),('staff','hr.leave.write'),('staff','hr.performance.read'),('staff','approvals.read')
) AS grants(role_name, permission_code)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "payroll_runs" ("tenant_id", "run_month", "run_year", "run_label", "status", "total_gross_paise", "total_deductions_paise", "total_net_paise", "staff_count", "created_at", "updated_at")
SELECT
  p."tenant_id",
  substring(p."pay_period" from 6 for 2)::int,
  substring(p."pay_period" from 1 for 4)::int,
  to_char(make_date(substring(p."pay_period" from 1 for 4)::int, substring(p."pay_period" from 6 for 2)::int, 1), 'FMMonth YYYY') || ' Payroll',
  CASE WHEN bool_and(p."payment_status" = 'paid') THEN 'locked' ELSE 'computed' END,
  sum((p."basic_salary" + p."allowances")::bigint * 100),
  sum(p."deductions"::bigint * 100),
  sum(((p."basic_salary" + p."allowances") - p."deductions")::bigint * 100),
  count(*)::int,
  min(p."created_at"),
  now()
FROM "staff_payroll" p
WHERE p."pay_period" ~ '^\d{4}-\d{2}$'
GROUP BY p."tenant_id", substring(p."pay_period" from 1 for 4), substring(p."pay_period" from 6 for 2)
ON CONFLICT ("tenant_id","run_month","run_year") DO NOTHING;
--> statement-breakpoint
INSERT INTO "payroll_run_entries" ("tenant_id", "run_id", "staff_id", "legacy_payroll_id", "working_days", "days_absent", "gross_paise", "basic_paise", "other_deductions_paise", "total_deductions_paise", "net_paise", "remarks", "created_at", "updated_at")
SELECT
  p."tenant_id",
  r."id",
  p."staff_profile_id",
  p."id",
  26,
  0,
  (p."basic_salary" + p."allowances")::bigint * 100,
  p."basic_salary"::bigint * 100,
  p."deductions"::bigint * 100,
  p."deductions"::bigint * 100,
  ((p."basic_salary" + p."allowances") - p."deductions")::bigint * 100,
  'Backfilled from legacy staff_payroll',
  p."created_at",
  now()
FROM "staff_payroll" p
JOIN "payroll_runs" r
  ON r."tenant_id" = p."tenant_id"
 AND r."run_year" = substring(p."pay_period" from 1 for 4)::int
 AND r."run_month" = substring(p."pay_period" from 6 for 2)::int
WHERE p."pay_period" ~ '^\d{4}-\d{2}$'
ON CONFLICT ("run_id","staff_id") DO NOTHING;
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'payroll_components','payroll_component_assignments','payroll_settings',
    'payroll_runs','payroll_run_entries','payroll_run_entry_lines','payslips',
    'staff_loans','staff_contracts','recruitment_postings','recruitment_applications',
    'recruitment_interviews','recruitment_offers','performance_cycles',
    'performance_reviews','staff_leave_types','staff_leave_balances',
    'staff_leave_requests'
  ]
  LOOP
    policy_name := table_name || '_tenant_isolation_policy';
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I ON %I USING (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting(''app.current_tenant'', true), '''')::uuid)',
      policy_name,
      table_name
    );
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epadm_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO epadm_app;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'epadm_ops') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epadm_ops;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO epadm_ops;
  END IF;
END $$;
