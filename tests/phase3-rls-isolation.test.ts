import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

const TABLES = [
  "custom_roles", "custom_role_grants", "data_import_jobs", "data_import_rows",
  "guardian_profiles", "staff_qualifications", "student_documents",
  "student_guardians", "student_notes", "student_status_history", "tenant_integrations",
] as const;

const opsUrl = process.env.OPS_DATABASE_URL;
const appUrl = process.env.DATABASE_URL;
let ops: Pool; let app: Pool;
const tenantA = randomUUID(); const tenantB = randomUUID();
const userA = randomUUID(); const userB = randomUUID();

describe("Phase 3 tenant isolation", () => {
  beforeAll(async () => {
    if (!opsUrl || !appUrl) throw new Error("DATABASE_URL and OPS_DATABASE_URL are required");
    ops = new Pool({ connectionString: opsUrl, max: 1 }); app = new Pool({ connectionString: appUrl, max: 1 });
    for (const [tenantId, userId, suffix] of [[tenantA,userA,"a"],[tenantB,userB,"b"]] as const) {
      await ops.query("insert into tenants (id,name,slug,subscription_tier,is_active) values ($1,$2,$3,'basic',true)",[tenantId,`Phase 3 RLS ${suffix}`,`phase3-rls-${suffix}-${Date.now()}`]);
      await ops.query("insert into users (id,name,email,password_hash,is_active) values ($1,$2,$3,'test-hash',true)",[userId,`RLS User ${suffix}`,`phase3-rls-${suffix}-${Date.now()}@example.test`]);
      const student=(await ops.query("insert into students (tenant_id,admission_number,first_name) values ($1,$2,'RLS Student') returning id",[tenantId,`P3-${suffix}-${Date.now()}`])).rows[0].id;
      const staff=(await ops.query("insert into staff_profiles (tenant_id,employee_code,full_name) values ($1,$2,'RLS Staff') returning id",[tenantId,`P3-${suffix}-${Date.now()}`])).rows[0].id;
      const guardian=(await ops.query("insert into guardian_profiles (tenant_id,first_name,last_name) values ($1,'RLS','Guardian') returning id",[tenantId])).rows[0].id;
      const role=(await ops.query("insert into custom_roles (tenant_id,name,base_role,created_by) values ($1,$2,'staff',$3) returning id",[tenantId,`RLS Role ${suffix}`,userId])).rows[0].id;
      await ops.query("insert into custom_role_grants (tenant_id,role_id,permission,effect,granted_by) values ($1,$2,'students.read','allow',$3)",[tenantId,role,userId]);
      const job=(await ops.query("insert into data_import_jobs (tenant_id,entity_type,status,file_name,file_url,started_by) values ($1,'students','valid','rls.csv','inline://rls.csv',$2) returning id",[tenantId,userId])).rows[0].id;
      await ops.query("insert into data_import_rows (tenant_id,job_id,row_number,status,raw_data) values ($1,$2,1,'valid','{}')",[tenantId,job]);
      await ops.query("insert into staff_qualifications (tenant_id,staff_id,degree,institution) values ($1,$2,'Test','Test')",[tenantId,staff]);
      await ops.query("insert into student_documents (tenant_id,student_id,document_type,label,file_url,file_name,uploaded_by) values ($1,$2,'test','Test','inline://test','test.txt',$3)",[tenantId,student,userId]);
      await ops.query("insert into student_guardians (tenant_id,student_id,guardian_id,relationship) values ($1,$2,$3,'legal_guardian')",[tenantId,student,guardian]);
      await ops.query("insert into student_notes (tenant_id,student_id,body,created_by) values ($1,$2,'RLS note',$3)",[tenantId,student,userId]);
      await ops.query("insert into student_status_history (tenant_id,student_id,to_status,reason,effective_date,changed_by) values ($1,$2,'active','RLS test',current_date,$3)",[tenantId,student,userId]);
      await ops.query("insert into tenant_integrations (tenant_id,integration_key,status) values ($1,'email','inactive')",[tenantId]);
    }
  });

  afterAll(async () => {
    if (ops) { await ops.query("delete from tenants where id = any($1::uuid[])",[[tenantA,tenantB]]).catch(()=>undefined); await ops.query("delete from users where id = any($1::uuid[])",[[userA,userB]]).catch(()=>undefined); await ops.end(); }
    if (app) await app.end();
  });

  it("enables and forces RLS with a tenant policy on every new table", async () => {
    const result=await ops.query("select c.relname,c.relrowsecurity,c.relforcerowsecurity,count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid=c.relnamespace left join pg_policies p on p.schemaname=n.nspname and p.tablename=c.relname where n.nspname='public' and c.relname=any($1::text[]) group by c.relname,c.relrowsecurity,c.relforcerowsecurity",[TABLES]);
    expect(result.rows).toHaveLength(TABLES.length); for(const row of result.rows){expect(row.relrowsecurity).toBe(true);expect(row.relforcerowsecurity).toBe(true);expect(row.policies).toBeGreaterThan(0)}
  });

  it("hides tenant B rows from tenant A on every new table", async () => {
    const client=await app.connect(); try { await client.query("begin"); await client.query("select set_config('app.current_tenant',$1,true)",[tenantA]); for(const table of TABLES){const result=await client.query(`select distinct tenant_id::text as tenant_id from "${table}"`);expect(result.rows).toEqual([{tenant_id:tenantA}])} await client.query("rollback"); } finally { client.release(); }
  });
});
