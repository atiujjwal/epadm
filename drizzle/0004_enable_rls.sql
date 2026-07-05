-- Enable Row-Level Security on tenant tables
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academic_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "class_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Create isolation policies scoped to 'app.current_tenant' configuration setting
CREATE POLICY tenant_isolation_policy ON "tenants"
  FOR ALL
  USING (id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "tenant_users"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "students"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "staff_profiles"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "academic_classes"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "class_sections"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "student_enrollments"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON "audit_logs"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
