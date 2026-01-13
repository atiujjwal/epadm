-- Enable RLS on the Nexus table
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- TENANT ISOLATION POLICY
-- Define isolation policy using session variable.
CREATE POLICY tenant_isolation_policy ON tenant_users
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (tenant_id = current_setting('app.current_tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- FORCE RLS
-- Prevent accidental leakage by table owners.
ALTER TABLE tenant_users FORCE ROW LEVEL SECURITY;

-- Note: 'users' and 'tenants' tables are generally public (global), 
-- but write access should be restricted via API logic or TODO: separate admin-only policies.
-- 'roles' is read-only reference data.