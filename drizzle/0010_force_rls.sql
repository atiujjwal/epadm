-- Force Row-Level Security on every tenant-scoped table.
--
-- Plain "ENABLE ROW LEVEL SECURITY" (migrations 0004, 0006-0009) does NOT apply
-- to the table owner, so a connection running as the table owner silently
-- bypasses tenant isolation. "FORCE ROW LEVEL SECURITY" makes the policies apply
-- to the owner as well. RLS is still bypassed by superusers and roles with the
-- BYPASSRLS attribute, so the application connection (DATABASE_URL) MUST be a
-- non-superuser role without BYPASSRLS. The control-plane connection
-- (OPS_DATABASE_URL / ops_worker) is expected to hold BYPASSRLS for legitimate
-- cross-tenant operations (provisioning, login/slug resolution, webhooks).
--
-- See docs/DATABASE_ROLES.md for the role setup this migration assumes.

ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "tenant_users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "students" FORCE ROW LEVEL SECURITY;
ALTER TABLE "staff_profiles" FORCE ROW LEVEL SECURITY;
ALTER TABLE "academic_classes" FORCE ROW LEVEL SECURITY;
ALTER TABLE "class_sections" FORCE ROW LEVEL SECURITY;
ALTER TABLE "student_enrollments" FORCE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "attendance" FORCE ROW LEVEL SECURITY;
ALTER TABLE "assignments" FORCE ROW LEVEL SECURITY;
ALTER TABLE "fee_structures" FORCE ROW LEVEL SECURITY;
ALTER TABLE "student_invoices" FORCE ROW LEVEL SECURITY;
ALTER TABLE "staff_payroll" FORCE ROW LEVEL SECURITY;
ALTER TABLE "financial_transactions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "exams" FORCE ROW LEVEL SECURITY;
ALTER TABLE "vehicle_telemetry" FORCE ROW LEVEL SECURITY;
