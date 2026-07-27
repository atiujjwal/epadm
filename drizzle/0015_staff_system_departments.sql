ALTER TABLE "staff_departments" ALTER COLUMN "code" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "staff_departments" ADD COLUMN "description" text;
--> statement-breakpoint
ALTER TABLE "staff_departments" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
INSERT INTO "staff_departments" ("tenant_id", "code", "name", "description", "is_system")
SELECT
  tenants.id,
  defaults.code,
  defaults.name,
  defaults.description,
  true
FROM "tenants"
CROSS JOIN (
  VALUES
    ('ACAD', 'Academics / Faculty', 'Teaching faculty, curriculum planning, and academic delivery'),
    ('ADMIN', 'Administration & HR', 'School administration, HR operations, and office coordination'),
    ('FIN', 'Accounts & Finance', 'Accounts, fees, payroll, budgeting, and finance operations'),
    ('HEALTH', 'Student Services & Health', 'Student wellbeing, counselling, health, and support services'),
    ('LIB', 'Library & Resources', 'Library operations, learning resources, and media assets'),
    ('TRANS', 'Facilities & Transport', 'Campus facilities, maintenance, security, and transport'),
    ('IT', 'IT & Support', 'IT systems, helpdesk support, devices, and infrastructure')
) AS defaults(code, name, description)
ON CONFLICT ("tenant_id", "code") DO UPDATE SET
  "name" = excluded."name",
  "description" = excluded."description",
  "is_system" = true,
  "updated_at" = now();
