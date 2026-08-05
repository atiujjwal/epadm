CREATE TABLE IF NOT EXISTS "notification_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(180) NOT NULL,
  "event_type" varchar(80),
  "channel" varchar(20) NOT NULL DEFAULT 'all' CHECK ("channel" IN ('sms','email','push','all')),
  "subject" text,
  "body_sms" text,
  "body_email" text,
  "body_push" text,
  "variables" text[],
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "channel" varchar(20) NOT NULL CHECK ("channel" IN ('sms','email','push')),
  "event_type" varchar(80) NOT NULL,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications_queue" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "template_id" uuid REFERENCES "notification_templates"("id") ON DELETE set null,
  "event_type" varchar(80),
  "recipient_user_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "recipient_phone" varchar(40),
  "recipient_email" varchar(255),
  "channel" varchar(20) NOT NULL CHECK ("channel" IN ('sms','email','push')),
  "subject" text,
  "body" text NOT NULL,
  "entity_type" varchar(80),
  "entity_id" uuid,
  "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','sending','sent','failed','cancelled')),
  "error_message" text,
  "scheduled_at" timestamp with time zone NOT NULL DEFAULT now(),
  "sent_at" timestamp with time zone,
  "attempts" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "title" varchar(255) NOT NULL,
  "body" text NOT NULL,
  "announcement_type" varchar(40) NOT NULL DEFAULT 'general' CHECK ("announcement_type" IN ('general','academic','exam','fee','event','emergency','other')),
  "priority" varchar(20) NOT NULL DEFAULT 'normal' CHECK ("priority" IN ('low','normal','high','urgent')),
  "target_role" varchar(30),
  "target_class_id" uuid REFERENCES "academic_classes"("id") ON DELETE set null,
  "target_section_id" uuid REFERENCES "class_sections"("id") ON DELETE set null,
  "published_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "is_draft" boolean NOT NULL DEFAULT true,
  "attachment_url" text,
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcement_reads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "announcement_id" uuid NOT NULL REFERENCES "announcements"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "read_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parent_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "guardian_id" uuid NOT NULL REFERENCES "guardian_profiles"("id") ON DELETE cascade,
  "subject" varchar(255) NOT NULL,
  "body" text NOT NULL,
  "direction" varchar(30) NOT NULL CHECK ("direction" IN ('parent_to_school','school_to_parent')),
  "parent_read" boolean NOT NULL DEFAULT false,
  "admin_read" boolean NOT NULL DEFAULT false,
  "reply_to_id" uuid REFERENCES "parent_messages"("id") ON DELETE set null,
  "created_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "name" varchar(180) NOT NULL,
  "document_type" varchar(60) NOT NULL DEFAULT 'certificate' CHECK ("document_type" IN ('transfer_certificate','bonafide_certificate','character_certificate','fee_receipt_letter','admission_letter','leaving_certificate','marksheet','custom','certificate')),
  "html_template" text NOT NULL,
  "variables" text[],
  "is_default" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "generated_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "template_id" uuid NOT NULL REFERENCES "document_templates"("id") ON DELETE restrict,
  "document_number" varchar(80) NOT NULL,
  "pdf_url" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','generated','failed')),
  "snapshot_data" jsonb NOT NULL DEFAULT '{}',
  "generated_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "generated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assignment_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
  "assignment_id" uuid NOT NULL REFERENCES "assignments"("id") ON DELETE cascade,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
  "content" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','submitted','graded','returned')),
  "submitted_at" timestamp with time zone,
  "is_late" boolean NOT NULL DEFAULT false,
  "score" numeric(6,2),
  "feedback" text,
  "graded_at" timestamp with time zone,
  "graded_by" uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "message_campaigns"
  ADD COLUMN IF NOT EXISTS "template_id" uuid REFERENCES "notification_templates"("id") ON DELETE set null,
  ADD COLUMN IF NOT EXISTS "target_role" varchar(30),
  ADD COLUMN IF NOT EXISTS "target_class_id" uuid REFERENCES "academic_classes"("id") ON DELETE set null,
  ADD COLUMN IF NOT EXISTS "target_section_id" uuid REFERENCES "class_sections"("id") ON DELETE set null,
  ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "sent_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "recipient_count" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "failed_count" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "leave_applications"
  ADD COLUMN IF NOT EXISTS "requested_by" uuid REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_templates_tenant_name_unique" ON "notification_templates" ("tenant_id","name");
CREATE INDEX IF NOT EXISTS "notification_templates_event_idx" ON "notification_templates" ("tenant_id","event_type");
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_channel_event_unique" ON "notification_preferences" ("user_id","channel","event_type");
CREATE INDEX IF NOT EXISTS "notification_preferences_tenant_user_idx" ON "notification_preferences" ("tenant_id","user_id");
CREATE INDEX IF NOT EXISTS "notifications_queue_pending_idx" ON "notifications_queue" ("tenant_id","status","scheduled_at");
CREATE INDEX IF NOT EXISTS "notifications_queue_recipient_idx" ON "notifications_queue" ("tenant_id","recipient_user_id","created_at");
CREATE INDEX IF NOT EXISTS "announcements_target_idx" ON "announcements" ("tenant_id","target_role","published_at");
CREATE INDEX IF NOT EXISTS "announcements_section_idx" ON "announcements" ("tenant_id","target_section_id","published_at");
CREATE UNIQUE INDEX IF NOT EXISTS "announcement_reads_announcement_user_unique" ON "announcement_reads" ("announcement_id","user_id");
CREATE INDEX IF NOT EXISTS "announcement_reads_tenant_user_idx" ON "announcement_reads" ("tenant_id","user_id");
CREATE INDEX IF NOT EXISTS "parent_messages_student_idx" ON "parent_messages" ("tenant_id","student_id","created_at");
CREATE INDEX IF NOT EXISTS "parent_messages_guardian_idx" ON "parent_messages" ("tenant_id","guardian_id","created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "document_templates_tenant_name_unique" ON "document_templates" ("tenant_id","name");
CREATE UNIQUE INDEX IF NOT EXISTS "document_templates_default_type_unique" ON "document_templates" ("tenant_id","document_type") WHERE "is_default" = true;
CREATE UNIQUE INDEX IF NOT EXISTS "generated_documents_tenant_number_unique" ON "generated_documents" ("tenant_id","document_number");
CREATE INDEX IF NOT EXISTS "generated_documents_student_idx" ON "generated_documents" ("tenant_id","student_id","generated_at");
CREATE UNIQUE INDEX IF NOT EXISTS "assignment_submissions_assignment_student_unique" ON "assignment_submissions" ("assignment_id","student_id");
CREATE INDEX IF NOT EXISTS "assignment_submissions_student_idx" ON "assignment_submissions" ("tenant_id","student_id","status");
--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
  ('communications.read', 'View announcements and campaign delivery.'),
  ('communications.announcements.manage', 'Create and publish tenant announcements.'),
  ('communications.campaigns.manage', 'Create and manage communication campaigns.'),
  ('communications.templates.manage', 'Manage notification templates.'),
  ('communications.queue.manage', 'View and manage notification delivery queue.'),
  ('communications.messages.manage', 'View and reply to parent messages.'),
  ('documents.read', 'View document templates, letters, and certificates.'),
  ('documents.templates.manage', 'Manage generated document templates.'),
  ('documents.generate', 'Generate student certificates and letters.'),
  ('digital-experience.configure', 'Configure portals, mobile apps, and branding.')
ON CONFLICT ("code") DO UPDATE SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role", "permission_code")
SELECT role_name, permission_code
FROM (
  VALUES
    ('superadmin','communications.announcements.manage'),('superadmin','communications.campaigns.manage'),('superadmin','communications.templates.manage'),('superadmin','communications.queue.manage'),('superadmin','communications.messages.manage'),('superadmin','documents.read'),('superadmin','documents.templates.manage'),('superadmin','documents.generate'),('superadmin','digital-experience.configure'),
    ('admin','communications.announcements.manage'),('admin','communications.campaigns.manage'),('admin','communications.templates.manage'),('admin','communications.queue.manage'),('admin','communications.messages.manage'),('admin','documents.read'),('admin','documents.templates.manage'),('admin','documents.generate'),('admin','digital-experience.configure'),
    ('teacher','communications.read'),('teacher','documents.read'),
    ('staff','communications.read'),('staff','documents.read'),
    ('parent','communications.read'),('parent','documents.read'),
    ('student','communications.read'),('student','documents.read')
) AS grants(role_name, permission_code)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'notification_templates','notification_preferences','notifications_queue',
    'announcements','announcement_reads','parent_messages',
    'document_templates','generated_documents','assignment_submissions'
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
