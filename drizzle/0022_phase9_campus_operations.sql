ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "driver_phone" varchar(30);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "helper_name" varchar(255);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "helper_phone" varchar(30);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "capacity" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "make_model" varchar(120);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "fuel_type" varchar(30);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "gps_device_id" varchar(100);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "insurance_expiry" date;
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "fitness_expiry" date;
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "permit_expiry" date;
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "pollution_expiry" date;
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "last_service_date" date;
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "next_service_date" date;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_tenant_gps_device_unique" ON "vehicles" ("tenant_id","gps_device_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_routes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "route_code" varchar(40) NOT NULL,
  "name" varchar(160) NOT NULL,
  "vehicle_id" uuid REFERENCES "vehicles"("id") ON DELETE set null,
  "driver_name" varchar(255),
  "helper_name" varchar(255),
  "distance_km" numeric(8,2),
  "monthly_fee_paise" bigint DEFAULT 0 NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "route_stops" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "route_id" uuid NOT NULL REFERENCES "vehicle_routes"("id") ON DELETE cascade,
  "stop_name" varchar(160) NOT NULL,
  "pickup_time" time,
  "drop_time" time,
  "sequence" integer NOT NULL,
  "latitude" numeric(10,7),
  "longitude" numeric(10,7),
  "fee_override_paise" bigint,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_transport_allocations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "academic_year_id" uuid REFERENCES "academic_years"("id") ON DELETE set null,
  "route_id" uuid NOT NULL REFERENCES "vehicle_routes"("id") ON DELETE restrict,
  "pickup_stop_id" uuid REFERENCES "route_stops"("id") ON DELETE set null,
  "drop_stop_id" uuid REFERENCES "route_stops"("id") ON DELETE set null,
  "start_date" date NOT NULL,
  "end_date" date,
  "monthly_fee_paise" bigint DEFAULT 0 NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_maintenance_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "vehicle_id" uuid NOT NULL REFERENCES "vehicles"("id") ON DELETE cascade,
  "maintenance_type" varchar(60) NOT NULL,
  "service_date" date NOT NULL,
  "odometer_km" integer,
  "vendor_name" varchar(160),
  "amount_paise" bigint DEFAULT 0 NOT NULL,
  "next_due_date" date,
  "notes" text,
  "created_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_tracking_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "vehicle_id" uuid REFERENCES "vehicles"("id") ON DELETE set null,
  "external_vehicle_id" varchar(100) NOT NULL,
  "latitude" numeric(10,7) NOT NULL,
  "longitude" numeric(10,7) NOT NULL,
  "speed" integer,
  "heading" integer,
  "ignition_on" boolean,
  "recorded_at" timestamp with time zone NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_routes_tenant_code_unique" ON "vehicle_routes" ("tenant_id","route_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicle_routes_tenant_status_idx" ON "vehicle_routes" ("tenant_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "route_stops_route_sequence_unique" ON "route_stops" ("route_id","sequence");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "route_stops_route_idx" ON "route_stops" ("tenant_id","route_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "student_transport_active_student_year_unique" ON "student_transport_allocations" ("tenant_id","student_id","academic_year_id") WHERE status = 'active';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "student_transport_student_idx" ON "student_transport_allocations" ("tenant_id","student_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "student_transport_route_idx" ON "student_transport_allocations" ("tenant_id","route_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicle_maintenance_vehicle_date_idx" ON "vehicle_maintenance_records" ("tenant_id","vehicle_id","service_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicle_tracking_vehicle_recorded_idx" ON "vehicle_tracking_events" ("tenant_id","external_vehicle_id","recorded_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicle_tracking_latest_idx" ON "vehicle_tracking_events" ("tenant_id","vehicle_id","recorded_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_titles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "title" varchar(255) NOT NULL,
  "subtitle" varchar(255),
  "author" varchar(255),
  "publisher" varchar(160),
  "isbn" varchar(32),
  "edition" varchar(80),
  "language" varchar(60),
  "subject" varchar(120),
  "classification" varchar(80),
  "legacy_group_key" varchar(512),
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "description" text,
  "cover_url" text,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_copies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "title_id" uuid NOT NULL REFERENCES "library_titles"("id") ON DELETE cascade,
  "legacy_book_id" uuid REFERENCES "library_books"("id") ON DELETE set null,
  "accession" varchar(60) NOT NULL,
  "barcode" varchar(80),
  "location" varchar(120),
  "shelf" varchar(80),
  "acquisition_date" date,
  "purchase_price_paise" bigint DEFAULT 0 NOT NULL,
  "status" varchar(20) DEFAULT 'available' NOT NULL,
  "condition" varchar(30) DEFAULT 'good' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "member_code" varchar(60) NOT NULL,
  "member_type" varchar(20) NOT NULL,
  "student_id" uuid REFERENCES "students"("id") ON DELETE cascade,
  "staff_id" uuid REFERENCES "staff_profiles"("id") ON DELETE cascade,
  "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "display_name" varchar(255) NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "blocked_reason" text,
  "max_active_issues" integer DEFAULT 3 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_settings" (
  "tenant_id" uuid PRIMARY KEY REFERENCES "tenants"("id") ON DELETE cascade,
  "default_loan_days" integer DEFAULT 14 NOT NULL,
  "max_renewals" integer DEFAULT 1 NOT NULL,
  "fine_per_day_paise" bigint DEFAULT 500 NOT NULL,
  "student_max_issues" integer DEFAULT 3 NOT NULL,
  "staff_max_issues" integer DEFAULT 6 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_issues" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "copy_id" uuid NOT NULL REFERENCES "library_copies"("id") ON DELETE restrict,
  "member_id" uuid NOT NULL REFERENCES "library_members"("id") ON DELETE restrict,
  "issued_at" timestamp with time zone DEFAULT now() NOT NULL,
  "due_date" date NOT NULL,
  "returned_at" timestamp with time zone,
  "renew_count" integer DEFAULT 0 NOT NULL,
  "status" varchar(20) DEFAULT 'issued' NOT NULL,
  "fine_paise" bigint DEFAULT 0 NOT NULL,
  "issued_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "returned_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_fines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "issue_id" uuid NOT NULL REFERENCES "library_issues"("id") ON DELETE cascade,
  "member_id" uuid NOT NULL REFERENCES "library_members"("id") ON DELETE cascade,
  "amount_paise" bigint NOT NULL,
  "paid_paise" bigint DEFAULT 0 NOT NULL,
  "status" varchar(20) DEFAULT 'open' NOT NULL,
  "reason" varchar(160) DEFAULT 'overdue' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_acquisitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "vendor_name" varchar(160),
  "order_number" varchar(80),
  "order_date" date,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "total_paise" bigint DEFAULT 0 NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_acquisition_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "acquisition_id" uuid NOT NULL REFERENCES "library_acquisitions"("id") ON DELETE cascade,
  "title_id" uuid REFERENCES "library_titles"("id") ON DELETE set null,
  "title" varchar(255) NOT NULL,
  "author" varchar(255),
  "isbn" varchar(32),
  "quantity" integer NOT NULL,
  "unit_price_paise" bigint DEFAULT 0 NOT NULL,
  "received_quantity" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_titles_tenant_isbn_unique" ON "library_titles" ("tenant_id","isbn");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_titles_tenant_legacy_group_unique" ON "library_titles" ("tenant_id","legacy_group_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_titles_search_idx" ON "library_titles" ("tenant_id","title","author");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_copies_tenant_accession_unique" ON "library_copies" ("tenant_id","accession");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_copies_legacy_book_unique" ON "library_copies" ("legacy_book_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_copies_title_idx" ON "library_copies" ("tenant_id","title_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_members_tenant_code_unique" ON "library_members" ("tenant_id","member_code");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_members_student_unique" ON "library_members" ("tenant_id","student_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_members_staff_unique" ON "library_members" ("tenant_id","staff_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_members_status_idx" ON "library_members" ("tenant_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_issues_active_copy_unique" ON "library_issues" ("copy_id") WHERE status in ('issued','overdue');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_issues_member_idx" ON "library_issues" ("tenant_id","member_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_issues_due_idx" ON "library_issues" ("tenant_id","due_date","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_fines_issue_unique" ON "library_fines" ("issue_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_fines_member_idx" ON "library_fines" ("tenant_id","member_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_acquisitions_tenant_order_unique" ON "library_acquisitions" ("tenant_id","order_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_acquisitions_status_idx" ON "library_acquisitions" ("tenant_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "library_acquisition_items_acquisition_idx" ON "library_acquisition_items" ("tenant_id","acquisition_id");
--> statement-breakpoint
INSERT INTO "library_titles" ("tenant_id","title","author","status","legacy_group_key","created_at","updated_at")
SELECT
  b."tenant_id",
  b."title",
  b."author",
  'active',
  md5(lower(trim(b."title")) || '|' || coalesce(lower(trim(b."author")), '')),
  min(b."created_at"),
  now()
FROM "library_books" b
GROUP BY b."tenant_id", b."title", b."author"
ON CONFLICT ("tenant_id","legacy_group_key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "library_copies" ("id","tenant_id","title_id","legacy_book_id","accession","status","created_at","updated_at")
SELECT
  b."id",
  b."tenant_id",
  t."id",
  b."id",
  b."accession",
  b."status",
  b."created_at",
  b."updated_at"
FROM "library_books" b
JOIN "library_titles" t
  ON t."tenant_id" = b."tenant_id"
 AND t."legacy_group_key" = md5(lower(trim(b."title")) || '|' || coalesce(lower(trim(b."author")), ''))
ON CONFLICT ("tenant_id","accession") DO NOTHING;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "laboratories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "code" varchar(40) NOT NULL,
  "name" varchar(160) NOT NULL,
  "lab_type" varchar(60) DEFAULT 'science' NOT NULL,
  "room_id" uuid REFERENCES "rooms"("id") ON DELETE set null,
  "capacity" integer DEFAULT 0 NOT NULL,
  "in_charge_staff_id" uuid REFERENCES "staff_profiles"("id") ON DELETE set null,
  "safety_instructions" text,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "laboratories_tenant_code_unique" ON "laboratories" ("tenant_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "laboratories_status_idx" ON "laboratories" ("tenant_id","status");
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "laboratory_id" uuid REFERENCES "laboratories"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "topic" varchar(160);
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "section_id" uuid REFERENCES "class_sections"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "period_id" uuid REFERENCES "timetable_periods"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "booking_date" date;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "teacher_staff_id" uuid REFERENCES "staff_profiles"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "cancelled_by" uuid REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "cancellation_reason" text;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ADD COLUMN IF NOT EXISTS "notes" text;
--> statement-breakpoint
INSERT INTO "laboratories" ("tenant_id","code","name","status","created_at","updated_at")
SELECT DISTINCT
  "tenant_id",
  ('LAB-' || upper(substr(md5(lower(trim("lab_name"))), 1, 8))),
  "lab_name",
  'active',
  min("created_at") OVER (PARTITION BY "tenant_id", "lab_name"),
  now()
FROM "lab_bookings"
ON CONFLICT ("tenant_id","code") DO NOTHING;
--> statement-breakpoint
UPDATE "lab_bookings" b
SET
  "laboratory_id" = l."id",
  "booking_date" = coalesce(b."booking_date", b."scheduled_at"::date),
  "topic" = coalesce(b."topic", b."session")
FROM "laboratories" l
WHERE b."tenant_id" = l."tenant_id"
  AND b."laboratory_id" IS NULL
  AND l."code" = ('LAB-' || upper(substr(md5(lower(trim(b."lab_name"))), 1, 8)));
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lab_bookings_lab_period_unique" ON "lab_bookings" ("tenant_id","laboratory_id","booking_date","period_id") WHERE status <> 'cancelled' and laboratory_id is not null and booking_date is not null and period_id is not null;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lab_bookings_section_period_unique" ON "lab_bookings" ("tenant_id","section_id","booking_date","period_id") WHERE status <> 'cancelled' and section_id is not null and booking_date is not null and period_id is not null;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_equipment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "laboratory_id" uuid NOT NULL REFERENCES "laboratories"("id") ON DELETE cascade,
  "asset_code" varchar(60) NOT NULL,
  "name" varchar(160) NOT NULL,
  "category" varchar(80),
  "quantity" integer DEFAULT 1 NOT NULL,
  "working_quantity" integer DEFAULT 1 NOT NULL,
  "condition" varchar(30) DEFAULT 'good' NOT NULL,
  "purchase_date" date,
  "purchase_price_paise" bigint DEFAULT 0 NOT NULL,
  "last_maintenance_date" date,
  "next_maintenance_date" date,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_consumables" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "laboratory_id" uuid NOT NULL REFERENCES "laboratories"("id") ON DELETE cascade,
  "item_code" varchar(60) NOT NULL,
  "name" varchar(160) NOT NULL,
  "unit" varchar(30) DEFAULT 'unit' NOT NULL,
  "quantity_on_hand" numeric(12,2) DEFAULT '0' NOT NULL,
  "reorder_level" numeric(12,2) DEFAULT '0' NOT NULL,
  "unit_cost_paise" bigint DEFAULT 0 NOT NULL,
  "hazard_class" varchar(80),
  "expiry_date" date,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_safety_incidents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "laboratory_id" uuid NOT NULL REFERENCES "laboratories"("id") ON DELETE cascade,
  "booking_id" uuid REFERENCES "lab_bookings"("id") ON DELETE set null,
  "incident_date" date NOT NULL,
  "severity" varchar(20) DEFAULT 'low' NOT NULL,
  "title" varchar(160) NOT NULL,
  "description" text,
  "action_taken" text,
  "reported_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "status" varchar(20) DEFAULT 'open' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lab_equipment_tenant_asset_unique" ON "lab_equipment" ("tenant_id","asset_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_equipment_lab_idx" ON "lab_equipment" ("tenant_id","laboratory_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lab_consumables_tenant_item_unique" ON "lab_consumables" ("tenant_id","item_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_consumables_lab_idx" ON "lab_consumables" ("tenant_id","laboratory_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_safety_incidents_lab_date_idx" ON "lab_safety_incidents" ("tenant_id","laboratory_id","incident_date");
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
  ('transport.read', 'View transport fleet, routes, and tracking.'),
  ('transport.fleet.write', 'Create and update transport fleet records.'),
  ('transport.routes.manage', 'Manage transport routes and stops.'),
  ('transport.allocations.manage', 'Assign student transport routes and stops.'),
  ('transport.maintenance.manage', 'Record vehicle maintenance and expenses.'),
  ('transport.tracking.read', 'View transport GPS tracking events.'),
  ('library.read', 'View the library catalog and circulation.'),
  ('library.settings.manage', 'Manage library lending and fine settings.'),
  ('library.catalog.manage', 'Manage library titles, copies, and accessions.'),
  ('library.members.manage', 'Manage library members and borrowing limits.'),
  ('library.circulation.manage', 'Issue, return, and renew library copies.'),
  ('library.fines.manage', 'Manage library fine records.'),
  ('library.acquisitions.manage', 'Manage library acquisitions and receiving.'),
  ('laboratories.read', 'View laboratory bookings, stock, and safety.'),
  ('laboratories.manage', 'Manage laboratory master records.'),
  ('laboratories.bookings.manage', 'Create and manage laboratory bookings.'),
  ('laboratories.inventory.manage', 'Manage laboratory equipment and consumables.'),
  ('laboratories.safety.manage', 'Record and manage laboratory safety incidents.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role", "permission_code")
SELECT role_name, permission_code
FROM (
  VALUES
    ('superadmin','transport.fleet.write'),('superadmin','transport.routes.manage'),('superadmin','transport.allocations.manage'),('superadmin','transport.maintenance.manage'),('superadmin','transport.tracking.read'),('superadmin','library.settings.manage'),('superadmin','library.catalog.manage'),('superadmin','library.members.manage'),('superadmin','library.circulation.manage'),('superadmin','library.fines.manage'),('superadmin','library.acquisitions.manage'),('superadmin','laboratories.manage'),('superadmin','laboratories.bookings.manage'),('superadmin','laboratories.inventory.manage'),('superadmin','laboratories.safety.manage'),
    ('admin','transport.fleet.write'),('admin','transport.routes.manage'),('admin','transport.allocations.manage'),('admin','transport.maintenance.manage'),('admin','transport.tracking.read'),('admin','library.settings.manage'),('admin','library.catalog.manage'),('admin','library.members.manage'),('admin','library.circulation.manage'),('admin','library.fines.manage'),('admin','library.acquisitions.manage'),('admin','laboratories.manage'),('admin','laboratories.bookings.manage'),('admin','laboratories.inventory.manage'),('admin','laboratories.safety.manage'),
    ('teacher','laboratories.read'),('teacher','laboratories.bookings.manage'),
    ('staff','transport.read'),('staff','laboratories.read'),('staff','laboratories.bookings.manage'),('staff','laboratories.inventory.manage'),('staff','laboratories.safety.manage'),
    ('librarian','library.settings.manage'),('librarian','library.catalog.manage'),('librarian','library.members.manage'),('librarian','library.circulation.manage'),('librarian','library.fines.manage'),('librarian','library.acquisitions.manage')
) AS grants(role_name, permission_code)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'vehicle_routes','route_stops','student_transport_allocations',
    'vehicle_maintenance_records','vehicle_tracking_events',
    'library_titles','library_copies','library_members','library_settings',
    'library_issues','library_fines','library_acquisitions','library_acquisition_items',
    'laboratories','lab_equipment','lab_consumables','lab_safety_incidents'
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
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "library_books" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "library_books" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lab_bookings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lab_bookings" FORCE ROW LEVEL SECURITY;
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
