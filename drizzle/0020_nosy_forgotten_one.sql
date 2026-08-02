CREATE TABLE "fee_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_plan_installments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"label" varchar(160) NOT NULL,
	"due_date" date NOT NULL,
	"amount_paise" bigint NOT NULL,
	"display_order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"structure_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"plan_type" varchar(20) DEFAULT 'custom' NOT NULL,
	"late_fee_per_day_paise" bigint DEFAULT 0 NOT NULL,
	"grace_period_days" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_structure_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"structure_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"label" varchar(160) NOT NULL,
	"amount_paise" bigint NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"parent_id" uuid,
	"code" varchar(20) NOT NULL,
	"name" varchar(160) NOT NULL,
	"type" varchar(20) NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_sequences" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"receipt_number" varchar(40) NOT NULL,
	"pdf_url" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"amount_paise" bigint NOT NULL,
	"payment_method" varchar(20) NOT NULL,
	"payment_date" date NOT NULL,
	"reference_number" varchar(160),
	"bank_name" varchar(160),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"gateway_payload" jsonb,
	"collected_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipt_sequences" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_fee_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"structure_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"concession_type" varchar(30),
	"concession_amount_paise" bigint DEFAULT 0 NOT NULL,
	"concession_note" text,
	"net_amount_paise" bigint NOT NULL,
	"assigned_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fee_structures" ADD COLUMN "academic_year_id" uuid;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD COLUMN "amount_paise" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD COLUMN "total_amount_paise" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "account_id" uuid;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "transaction_type" varchar(20);--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "amount_paise" bigint;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "transaction_date" date;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "reference" varchar(160);--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "payment_transaction_id" uuid;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "source" varchar(40);--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "source_id" uuid;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "receipt_photo_url" text;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "assignment_id" uuid;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "installment_id" uuid;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "invoice_number" varchar(40);--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "period_label" varchar(120);--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "subtotal_paise" bigint;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "concession_paise" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "late_fee_paise" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "total_paise" bigint;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "paid_paise" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "balance_paise" bigint;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "voided_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "void_reason" text;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD COLUMN "void_by" uuid;--> statement-breakpoint
ALTER TABLE "fee_categories" ADD CONSTRAINT "fee_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plan_installments" ADD CONSTRAINT "fee_plan_installments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plan_installments" ADD CONSTRAINT "fee_plan_installments_plan_id_fee_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."fee_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plans" ADD CONSTRAINT "fee_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_plans" ADD CONSTRAINT "fee_plans_structure_id_fee_structures_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."fee_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structure_items" ADD CONSTRAINT "fee_structure_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structure_items" ADD CONSTRAINT "fee_structure_items_structure_id_fee_structures_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."fee_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structure_items" ADD CONSTRAINT "fee_structure_items_category_id_fee_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."fee_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_sequences" ADD CONSTRAINT "invoice_sequences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoice_id_student_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."student_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_collected_by_users_id_fk" FOREIGN KEY ("collected_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_sequences" ADD CONSTRAINT "receipt_sequences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_structure_id_fee_structures_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."fee_structures"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_plan_id_fee_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."fee_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fee_categories_tenant_name_unique" ON "fee_categories" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "fee_plan_installments_plan_idx" ON "fee_plan_installments" USING btree ("plan_id","due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "fee_plans_structure_name_unique" ON "fee_plans" USING btree ("structure_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "fee_plans_one_default_per_structure" ON "fee_plans" USING btree ("structure_id") WHERE "fee_plans"."is_default" = true;--> statement-breakpoint
CREATE INDEX "fee_structure_items_structure_idx" ON "fee_structure_items" USING btree ("structure_id");--> statement-breakpoint
CREATE UNIQUE INDEX "financial_accounts_tenant_code_unique" ON "financial_accounts" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "financial_accounts_parent_idx" ON "financial_accounts" USING btree ("tenant_id","parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_receipts_tenant_receipt_number_unique" ON "payment_receipts" USING btree ("tenant_id","receipt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_receipts_transaction_unique" ON "payment_receipts" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_invoice_idx" ON "payment_transactions" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_student_idx" ON "payment_transactions" USING btree ("student_id","payment_date");--> statement-breakpoint
CREATE INDEX "payment_transactions_date_idx" ON "payment_transactions" USING btree ("tenant_id","payment_date");--> statement-breakpoint
CREATE UNIQUE INDEX "student_fee_assignments_student_year_unique" ON "student_fee_assignments" USING btree ("student_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "student_fee_assignments_student_idx" ON "student_fee_assignments" USING btree ("student_id","academic_year_id");--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_account_id_financial_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_payment_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("payment_transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_assignment_id_student_fee_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."student_fee_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_installment_id_fee_plan_installments_id_fk" FOREIGN KEY ("installment_id") REFERENCES "public"."fee_plan_installments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_void_by_users_id_fk" FOREIGN KEY ("void_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fee_structures_year_class_idx" ON "fee_structures" USING btree ("tenant_id","academic_year_id","class_id");--> statement-breakpoint
CREATE INDEX "financial_transactions_tenant_date_idx" ON "financial_transactions" USING btree ("tenant_id","transaction_date");--> statement-breakpoint
CREATE INDEX "financial_transactions_account_date_idx" ON "financial_transactions" USING btree ("account_id","transaction_date");--> statement-breakpoint
CREATE INDEX "financial_transactions_source_idx" ON "financial_transactions" USING btree ("tenant_id","source","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_invoices_tenant_invoice_number_unique" ON "student_invoices" USING btree ("tenant_id","invoice_number") WHERE "student_invoices"."invoice_number" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "student_invoices_assignment_installment_unique" ON "student_invoices" USING btree ("tenant_id","assignment_id","installment_id") WHERE "student_invoices"."assignment_id" is not null and "student_invoices"."installment_id" is not null and "student_invoices"."voided_at" is null;--> statement-breakpoint
CREATE INDEX "student_invoices_student_due_idx" ON "student_invoices" USING btree ("tenant_id","student_id","due_date");
--> statement-breakpoint
UPDATE "fee_structures"
SET
	"amount_paise" = "amount"::bigint * 100,
	"total_amount_paise" = "amount"::bigint * 100
WHERE "amount_paise" = 0 AND "total_amount_paise" = 0;
--> statement-breakpoint
UPDATE "student_invoices"
SET
	"period_label" = COALESCE("period_label", "title"),
	"subtotal_paise" = COALESCE("subtotal_paise", "amount"::bigint * 100),
	"total_paise" = COALESCE("total_paise", "amount"::bigint * 100),
	"paid_paise" = CASE WHEN "status" = 'paid' THEN COALESCE("total_paise", "amount"::bigint * 100) ELSE "paid_paise" END,
	"balance_paise" = CASE WHEN "status" = 'paid' THEN 0 ELSE COALESCE("balance_paise", "amount"::bigint * 100) END;
--> statement-breakpoint
UPDATE "financial_transactions"
SET
	"amount_paise" = COALESCE("amount_paise", "amount"::bigint * 100),
	"transaction_date" = COALESCE("transaction_date", "date"),
	"transaction_type" = COALESCE("transaction_type", CASE WHEN "type" = 'credit' THEN 'income' ELSE 'expense' END),
	"source" = COALESCE("source", CASE WHEN "invoice_id" IS NOT NULL THEN 'legacy_invoice' WHEN "payroll_id" IS NOT NULL THEN 'legacy_payroll' ELSE 'manual' END);
--> statement-breakpoint
ALTER TABLE "fee_plan_installments" ADD CONSTRAINT "fee_plan_installments_amount_positive_check" CHECK ("amount_paise" >= 0);
--> statement-breakpoint
ALTER TABLE "fee_plans" ADD CONSTRAINT "fee_plans_type_check" CHECK ("plan_type" IN ('lump_sum','quarterly','monthly','custom'));
--> statement-breakpoint
ALTER TABLE "fee_plans" ADD CONSTRAINT "fee_plans_late_fee_nonnegative_check" CHECK ("late_fee_per_day_paise" >= 0 AND "grace_period_days" >= 0);
--> statement-breakpoint
ALTER TABLE "fee_structure_items" ADD CONSTRAINT "fee_structure_items_amount_positive_check" CHECK ("amount_paise" >= 0);
--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_amount_paise_nonnegative_check" CHECK ("amount_paise" >= 0 AND "total_amount_paise" >= 0);
--> statement-breakpoint
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_type_check" CHECK ("type" IN ('income','expense'));
--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_type_check" CHECK ("transaction_type" IS NULL OR "transaction_type" IN ('income','expense'));
--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_amount_paise_nonnegative_check" CHECK ("amount_paise" IS NULL OR "amount_paise" >= 0);
--> statement-breakpoint
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_status_check" CHECK ("status" IN ('pending','generated','failed'));
--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_method_check" CHECK ("payment_method" IN ('cash','cheque','dd','upi','card','neft','rtgs','online','other'));
--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_status_check" CHECK ("status" IN ('pending','completed','bounced','refunded','cancelled'));
--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_amount_positive_check" CHECK ("amount_paise" > 0);
--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_concession_type_check" CHECK ("concession_type" IS NULL OR "concession_type" IN ('staff_ward','scholarship','sibling','merit','other'));
--> statement-breakpoint
ALTER TABLE "student_fee_assignments" ADD CONSTRAINT "student_fee_assignments_amounts_nonnegative_check" CHECK ("concession_amount_paise" >= 0 AND "net_amount_paise" >= 0);
--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_status_check" CHECK ("status" IN ('pending','partial','paid','overdue','voided'));
--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_amounts_nonnegative_check" CHECK (
	("subtotal_paise" IS NULL OR "subtotal_paise" >= 0)
	AND "concession_paise" >= 0
	AND "late_fee_paise" >= 0
	AND ("total_paise" IS NULL OR "total_paise" >= 0)
	AND "paid_paise" >= 0
	AND ("balance_paise" IS NULL OR "balance_paise" >= 0)
);
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
	('finance.fees.write', 'Create and manage fee structures, plans, and invoices.'),
	('finance.fees.assign', 'Assign fee plans and concessions to students.'),
	('finance.fees.invoices.generate', 'Generate student invoices from assigned fee plans.'),
	('finance.fees.payments.record', 'Record fee payments and issue receipts.'),
	('finance.fees.void', 'Void unpaid fee invoices.'),
	('finance.accounting.accounts.manage', 'Manage chart of accounts.'),
	('finance.accounting.expenses.record', 'Record manual accounting expenses.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
DO $$
DECLARE
	table_name text;
	policy_name text;
BEGIN
	FOREACH table_name IN ARRAY ARRAY[
		'fee_categories', 'fee_structure_items', 'fee_plans',
		'fee_plan_installments', 'student_fee_assignments',
		'invoice_sequences', 'receipt_sequences', 'payment_transactions',
		'payment_receipts', 'financial_accounts'
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
