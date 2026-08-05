CREATE TABLE IF NOT EXISTS "hostel_buildings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(160) NOT NULL,
  "building_type" varchar(20) NOT NULL DEFAULT 'mixed' CHECK ("building_type" IN ('boys','girls','mixed','staff')),
  "warden_id" uuid REFERENCES "staff_profiles"("id") ON DELETE set null,
  "total_rooms" integer NOT NULL DEFAULT 0,
  "capacity" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hostel_rooms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "building_id" uuid NOT NULL REFERENCES "hostel_buildings"("id") ON DELETE cascade,
  "room_number" varchar(40) NOT NULL,
  "floor" integer NOT NULL DEFAULT 0,
  "room_type" varchar(20) NOT NULL DEFAULT 'shared' CHECK ("room_type" IN ('single','double','triple','shared','dormitory')),
  "capacity" integer NOT NULL DEFAULT 2 CHECK ("capacity" >= 0),
  "current_occupancy" integer NOT NULL DEFAULT 0 CHECK ("current_occupancy" >= 0),
  "amenities" text[],
  "monthly_fee_paise" bigint NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'available' CHECK ("status" IN ('available','full','maintenance','closed')),
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ("current_occupancy" <= "capacity")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hostel_allocations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "room_id" uuid NOT NULL REFERENCES "hostel_rooms"("id") ON DELETE restrict,
  "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE restrict,
  "check_in_date" date NOT NULL,
  "check_out_date" date,
  "status" varchar(20) NOT NULL DEFAULT 'active' CHECK ("status" IN ('active','checked_out','transferred')),
  "allocated_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hostel_leave_passes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "allocation_id" uuid NOT NULL REFERENCES "hostel_allocations"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "leave_from" timestamp with time zone NOT NULL,
  "leave_to" timestamp with time zone NOT NULL,
  "destination" varchar(255) NOT NULL,
  "contact_person" varchar(160),
  "contact_phone" varchar(30),
  "reason" text NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','approved','rejected','returned')),
  "approved_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "approval_note" text,
  "actual_return" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(180) NOT NULL,
  "vendor_code" varchar(60),
  "contact_name" varchar(160),
  "email" varchar(255),
  "phone" varchar(30),
  "address" text,
  "gstin" varchar(30),
  "pan" varchar(20),
  "payment_terms" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(160) NOT NULL,
  "item_type" varchar(20) NOT NULL DEFAULT 'consumable' CHECK ("item_type" IN ('consumable','asset')),
  "description" text,
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "category_id" uuid NOT NULL REFERENCES "inventory_categories"("id") ON DELETE restrict,
  "name" varchar(180) NOT NULL,
  "item_code" varchar(60),
  "description" text,
  "unit" varchar(30) NOT NULL DEFAULT 'piece',
  "minimum_stock" numeric(12,2) NOT NULL DEFAULT '0',
  "reorder_level" numeric(12,2) NOT NULL DEFAULT '0',
  "unit_cost_paise" bigint NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_stock" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "item_id" uuid NOT NULL REFERENCES "inventory_items"("id") ON DELETE cascade,
  "location" varchar(120) NOT NULL DEFAULT 'main_store',
  "quantity" numeric(12,2) NOT NULL DEFAULT '0',
  "last_updated" timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ("quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "item_id" uuid NOT NULL REFERENCES "inventory_items"("id") ON DELETE restrict,
  "transaction_type" varchar(30) NOT NULL CHECK ("transaction_type" IN ('receipt','issue','transfer','adjustment','return','loss')),
  "quantity" numeric(12,2) NOT NULL,
  "unit_cost_paise" bigint,
  "total_cost_paise" bigint,
  "from_location" varchar(120),
  "to_location" varchar(120),
  "reference" varchar(120),
  "department_id" uuid REFERENCES "staff_departments"("id") ON DELETE set null,
  "vendor_id" uuid REFERENCES "vendors"("id") ON DELETE set null,
  "issued_to" uuid REFERENCES "users"("id") ON DELETE set null,
  "notes" text,
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_requisitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "requisition_number" varchar(60) NOT NULL,
  "requested_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "department_id" uuid REFERENCES "staff_departments"("id") ON DELETE set null,
  "required_by_date" date,
  "priority" varchar(20) NOT NULL DEFAULT 'normal' CHECK ("priority" IN ('low','normal','urgent','critical')),
  "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','approved','rejected','po_raised','fulfilled')),
  "approved_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "approved_at" timestamp with time zone,
  "rejection_note" text,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_requisition_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "requisition_id" uuid NOT NULL REFERENCES "purchase_requisitions"("id") ON DELETE cascade,
  "item_id" uuid NOT NULL REFERENCES "inventory_items"("id") ON DELETE restrict,
  "quantity" numeric(12,2) NOT NULL,
  "est_unit_cost_paise" bigint,
  "notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "category_id" uuid NOT NULL REFERENCES "inventory_categories"("id") ON DELETE restrict,
  "vendor_id" uuid REFERENCES "vendors"("id") ON DELETE set null,
  "asset_code" varchar(60) NOT NULL,
  "name" varchar(180) NOT NULL,
  "description" text,
  "serial_number" varchar(120),
  "location" varchar(120),
  "department_id" uuid REFERENCES "staff_departments"("id") ON DELETE set null,
  "purchase_date" date NOT NULL,
  "purchase_cost_paise" bigint NOT NULL DEFAULT 0,
  "current_value_paise" bigint NOT NULL DEFAULT 0,
  "useful_life_years" integer NOT NULL DEFAULT 5 CHECK ("useful_life_years" > 0),
  "depreciation_method" varchar(30) NOT NULL DEFAULT 'straight_line' CHECK ("depreciation_method" IN ('straight_line','written_down_value')),
  "salvage_value_paise" bigint NOT NULL DEFAULT 0,
  "warranty_expiry" date,
  "condition" varchar(30) NOT NULL DEFAULT 'good',
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_condition_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "asset_id" uuid NOT NULL REFERENCES "assets"("id") ON DELETE cascade,
  "condition" varchar(30) NOT NULL,
  "notes" text,
  "recorded_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "recorded_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facility_spaces" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "room_id" uuid REFERENCES "rooms"("id") ON DELETE set null,
  "name" varchar(180) NOT NULL,
  "space_type" varchar(40) NOT NULL DEFAULT 'hall',
  "capacity" integer NOT NULL DEFAULT 0,
  "location" varchar(160),
  "is_bookable" boolean NOT NULL DEFAULT true,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facility_bookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "space_id" uuid NOT NULL REFERENCES "facility_spaces"("id") ON DELETE cascade,
  "booking_date" date NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "purpose" varchar(255) NOT NULL,
  "requested_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "status" varchar(20) NOT NULL DEFAULT 'confirmed' CHECK ("status" IN ('pending','confirmed','cancelled','completed')),
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ("start_time" < "end_time")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facility_work_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "work_order_number" varchar(60) NOT NULL,
  "title" varchar(180) NOT NULL,
  "category" varchar(60) NOT NULL DEFAULT 'maintenance',
  "priority" varchar(20) NOT NULL DEFAULT 'normal' CHECK ("priority" IN ('low','normal','urgent','emergency')),
  "location" varchar(180),
  "description" text,
  "status" varchar(20) NOT NULL DEFAULT 'open' CHECK ("status" IN ('open','assigned','in_progress','completed','cancelled')),
  "requested_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "assigned_to" uuid REFERENCES "staff_profiles"("id") ON DELETE set null,
  "due_date" date,
  "completed_at" timestamp with time zone,
  "cost_paise" bigint NOT NULL DEFAULT 0,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "visitor_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "pass_number" varchar(60) NOT NULL,
  "visitor_name" varchar(180) NOT NULL,
  "phone" varchar(30) NOT NULL,
  "purpose" varchar(255) NOT NULL,
  "whom_to_meet" varchar(180) NOT NULL,
  "student_id" uuid REFERENCES "students"("id") ON DELETE set null,
  "id_type" varchar(40),
  "id_last4" varchar(4),
  "check_in" timestamp with time zone NOT NULL DEFAULT now(),
  "check_out" timestamp with time zone,
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "health_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "visit_at" timestamp with time zone NOT NULL,
  "complaint" text NOT NULL,
  "diagnosis" text,
  "treatment" text,
  "medication" text,
  "temperature" varchar(30),
  "blood_pressure" varchar(30),
  "is_emergency" boolean NOT NULL DEFAULT false,
  "parent_notified" boolean NOT NULL DEFAULT false,
  "referred_to" varchar(255),
  "referred_at" timestamp with time zone,
  "recorded_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(180) NOT NULL,
  "activity_type" varchar(40) NOT NULL DEFAULT 'sports' CHECK ("activity_type" IN ('sports','arts','culture','academic','club','service','other')),
  "coordinator_staff_id" uuid REFERENCES "staff_profiles"("id") ON DELETE set null,
  "schedule" varchar(255),
  "description" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "activity_id" uuid NOT NULL REFERENCES "activities"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE restrict,
  "role" varchar(30) NOT NULL DEFAULT 'member' CHECK ("role" IN ('member','captain','vice_captain','manager')),
  "joined_date" date NOT NULL,
  "left_date" date,
  "status" varchar(20) NOT NULL DEFAULT 'active' CHECK ("status" IN ('active','inactive')),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "activity_id" uuid NOT NULL REFERENCES "activities"("id") ON DELETE cascade,
  "name" varchar(180) NOT NULL,
  "event_date" date NOT NULL,
  "level" varchar(40) NOT NULL DEFAULT 'school',
  "venue" varchar(180),
  "result" varchar(255),
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_achievements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "activity_id" uuid REFERENCES "activities"("id") ON DELETE set null,
  "event_id" uuid REFERENCES "activity_events"("id") ON DELETE set null,
  "academic_year_id" uuid REFERENCES "academic_years"("id") ON DELETE set null,
  "title" varchar(180) NOT NULL,
  "achievement_type" varchar(60) NOT NULL DEFAULT 'participation',
  "level" varchar(40) NOT NULL DEFAULT 'school',
  "position" varchar(60),
  "achievement_date" date NOT NULL,
  "awarded_by" varchar(180),
  "certificate_url" varchar(2048),
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hostel_buildings_tenant_name_unique" ON "hostel_buildings" ("tenant_id","name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hostel_buildings_tenant_active_idx" ON "hostel_buildings" ("tenant_id","is_active");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hostel_rooms_building_room_unique" ON "hostel_rooms" ("building_id","room_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hostel_rooms_tenant_building_status_idx" ON "hostel_rooms" ("tenant_id","building_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hostel_allocations_student_year_unique" ON "hostel_allocations" ("tenant_id","student_id","academic_year_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hostel_allocations_room_year_idx" ON "hostel_allocations" ("tenant_id","room_id","academic_year_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hostel_allocations_student_idx" ON "hostel_allocations" ("tenant_id","student_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hostel_leave_passes_student_status_idx" ON "hostel_leave_passes" ("tenant_id","student_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vendors_tenant_name_unique" ON "vendors" ("tenant_id","name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vendors_tenant_code_unique" ON "vendors" ("tenant_id","vendor_code") WHERE vendor_code IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_categories_tenant_name_unique" ON "inventory_categories" ("tenant_id","name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_items_tenant_code_unique" ON "inventory_items" ("tenant_id","item_code") WHERE item_code IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_items_category_idx" ON "inventory_items" ("tenant_id","category_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_stock_item_location_unique" ON "inventory_stock" ("tenant_id","item_id","location");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_transactions_item_created_idx" ON "inventory_transactions" ("tenant_id","item_id","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_transactions_dept_created_idx" ON "inventory_transactions" ("tenant_id","department_id","created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_requisitions_tenant_number_unique" ON "purchase_requisitions" ("tenant_id","requisition_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_requisition_items_req_idx" ON "purchase_requisition_items" ("tenant_id","requisition_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "assets_tenant_asset_code_unique" ON "assets" ("tenant_id","asset_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assets_category_status_idx" ON "assets" ("tenant_id","category_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_condition_history_asset_recorded_idx" ON "asset_condition_history" ("tenant_id","asset_id","recorded_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "facility_spaces_tenant_name_unique" ON "facility_spaces" ("tenant_id","name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "facility_bookings_space_date_idx" ON "facility_bookings" ("tenant_id","space_id","booking_date");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "facility_work_orders_tenant_number_unique" ON "facility_work_orders" ("tenant_id","work_order_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "facility_work_orders_status_priority_idx" ON "facility_work_orders" ("tenant_id","status","priority");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "visitor_records_tenant_pass_unique" ON "visitor_records" ("tenant_id","pass_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "visitor_records_active_idx" ON "visitor_records" ("tenant_id","check_out");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "health_records_student_visit_idx" ON "health_records" ("tenant_id","student_id","visit_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "activities_tenant_name_unique" ON "activities" ("tenant_id","name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "activity_members_activity_student_year_unique" ON "activity_members" ("tenant_id","activity_id","student_id","academic_year_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_members_student_idx" ON "activity_members" ("tenant_id","student_id","academic_year_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_events_activity_date_idx" ON "activity_events" ("tenant_id","activity_id","event_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "student_achievements_student_year_idx" ON "student_achievements" ("tenant_id","student_id","academic_year_id");
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
  ('hostel.read', 'View hostel buildings, rooms, and allocations.'),
  ('hostel.rooms.manage', 'Create and manage hostel buildings and rooms.'),
  ('hostel.allocations.manage', 'Allocate and check out hostel residents.'),
  ('hostel.leave.manage', 'Approve and manage hostel leave passes.'),
  ('inventory.read', 'View inventory, procurement, and assets.'),
  ('inventory.stock.manage', 'Record inventory stock receipts, issues, transfers, and adjustments.'),
  ('inventory.requisitions.read', 'View inventory purchase requisitions.'),
  ('inventory.requisitions.write', 'Create inventory purchase requisitions.'),
  ('inventory.requisitions.approve', 'Approve inventory requisitions and issue stock.'),
  ('inventory.assets.read', 'View asset register and depreciation.'),
  ('inventory.assets.manage', 'Create and manage asset register records.'),
  ('inventory.vendors.manage', 'Create and manage inventory vendors.'),
  ('facilities.read', 'View facilities, safety, and work orders.'),
  ('facilities.spaces.manage', 'Create and manage facility spaces.'),
  ('facilities.bookings.manage', 'Create and manage facility space bookings.'),
  ('facilities.work-orders.read', 'View facilities work orders.'),
  ('facilities.work-orders.create', 'Create facilities work orders.'),
  ('facilities.work-orders.manage', 'Assign and complete facilities work orders.'),
  ('facilities.visitors.manage', 'Manage visitor sign-in and sign-out records.'),
  ('facilities.health.manage', 'Manage sensitive student health records.'),
  ('activities.read', 'View activities, events, and achievements.'),
  ('activities.manage', 'Create and manage activities and events.'),
  ('activities.members.manage', 'Manage activity memberships.'),
  ('activities.achievements.manage', 'Record student activity achievements.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role", "permission_code")
SELECT role_name, permission_code
FROM (
  VALUES
    ('superadmin','hostel.read'),('superadmin','hostel.rooms.manage'),('superadmin','hostel.allocations.manage'),('superadmin','hostel.leave.manage'),('superadmin','inventory.read'),('superadmin','inventory.stock.manage'),('superadmin','inventory.requisitions.read'),('superadmin','inventory.requisitions.write'),('superadmin','inventory.requisitions.approve'),('superadmin','inventory.assets.read'),('superadmin','inventory.assets.manage'),('superadmin','inventory.vendors.manage'),('superadmin','facilities.read'),('superadmin','facilities.spaces.manage'),('superadmin','facilities.bookings.manage'),('superadmin','facilities.work-orders.read'),('superadmin','facilities.work-orders.create'),('superadmin','facilities.work-orders.manage'),('superadmin','facilities.visitors.manage'),('superadmin','facilities.health.manage'),('superadmin','activities.read'),('superadmin','activities.manage'),('superadmin','activities.members.manage'),('superadmin','activities.achievements.manage'),
    ('admin','hostel.read'),('admin','hostel.rooms.manage'),('admin','hostel.allocations.manage'),('admin','hostel.leave.manage'),('admin','inventory.read'),('admin','inventory.stock.manage'),('admin','inventory.requisitions.read'),('admin','inventory.requisitions.write'),('admin','inventory.requisitions.approve'),('admin','inventory.assets.read'),('admin','inventory.assets.manage'),('admin','inventory.vendors.manage'),('admin','facilities.read'),('admin','facilities.spaces.manage'),('admin','facilities.bookings.manage'),('admin','facilities.work-orders.read'),('admin','facilities.work-orders.create'),('admin','facilities.work-orders.manage'),('admin','facilities.visitors.manage'),('admin','facilities.health.manage'),('admin','activities.read'),('admin','activities.manage'),('admin','activities.members.manage'),('admin','activities.achievements.manage'),
    ('teacher','facilities.read'),('teacher','facilities.work-orders.read'),('teacher','facilities.work-orders.create'),('teacher','facilities.bookings.manage'),('teacher','activities.read'),
    ('staff','inventory.requisitions.read'),('staff','inventory.requisitions.write'),('staff','facilities.read'),('staff','facilities.work-orders.read'),('staff','facilities.work-orders.create'),('staff','facilities.bookings.manage'),('staff','activities.read'),
    ('accountant','inventory.read'),('accountant','inventory.assets.read'),('accountant','inventory.vendors.manage'),
    ('librarian','inventory.requisitions.read'),('librarian','inventory.requisitions.write')
) AS grants(role_name, permission_code)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'hostel_buildings','hostel_rooms','hostel_allocations','hostel_leave_passes',
    'vendors','inventory_categories','inventory_items','inventory_stock',
    'inventory_transactions','purchase_requisitions','purchase_requisition_items',
    'assets','asset_condition_history',
    'facility_spaces','facility_bookings','facility_work_orders','visitor_records','health_records',
    'activities','activity_members','activity_events','student_achievements'
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
