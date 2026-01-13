-- ENABLE RLS on all tables
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- DEFINING THE SHARED POLICY : "tenant_isolation_policy"
-- We can reuse the same policy logic for all tables in this domain.

-- Students Policy
CREATE POLICY tenant_isolation_students ON students
    AS PERMISSIVE FOR ALL
    TO public
    USING (tenant_id = current_setting('app.current_tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- Classes Policy
CREATE POLICY tenant_isolation_classes ON classes
    AS PERMISSIVE FOR ALL
    TO public
    USING (tenant_id = current_setting('app.current_tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- Sections Policy
CREATE POLICY tenant_isolation_sections ON sections
    AS PERMISSIVE FOR ALL
    TO public
    USING (tenant_id = current_setting('app.current_tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- FORCE RLS to prevent superuser accidents
ALTER TABLE students FORCE ROW LEVEL SECURITY;
ALTER TABLE classes FORCE ROW LEVEL SECURITY;
ALTER TABLE sections FORCE ROW LEVEL SECURITY;