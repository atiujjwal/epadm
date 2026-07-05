CREATE TABLE IF NOT EXISTS "fee_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"amount" integer NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "student_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"due_date" date NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "staff_payroll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"staff_profile_id" uuid NOT NULL,
	"basic_salary" integer NOT NULL,
	"allowances" integer DEFAULT 0 NOT NULL,
	"deductions" integer DEFAULT 0 NOT NULL,
	"payment_status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"pay_period" varchar(20) NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "financial_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"date" date NOT NULL,
	"description" text NOT NULL,
	"invoice_id" uuid,
	"payroll_id" uuid,
	"category" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_class_id_academic_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."academic_classes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_enrollment_id_student_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."student_enrollments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "staff_payroll" ADD CONSTRAINT "staff_payroll_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "staff_payroll" ADD CONSTRAINT "staff_payroll_staff_profile_id_staff_profiles_id_fk" FOREIGN KEY ("staff_profile_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_invoice_id_student_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."student_invoices"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_payroll_id_staff_payroll_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."staff_payroll"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "fee_structures_tenant_class_name_year_unique" ON "fee_structures" USING btree ("tenant_id","class_id","name","academic_year");
CREATE UNIQUE INDEX IF NOT EXISTS "staff_payroll_tenant_staff_period_unique" ON "staff_payroll" USING btree ("tenant_id","staff_profile_id","pay_period");

-- Enable Row-Level Security on all new tables
ALTER TABLE "fee_structures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_payroll" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "financial_transactions" ENABLE ROW LEVEL SECURITY;

-- Create isolation policies
CREATE POLICY tenant_isolation_policy ON "fee_structures"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "student_invoices"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "staff_payroll"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "financial_transactions"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
