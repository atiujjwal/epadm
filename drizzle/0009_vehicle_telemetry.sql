CREATE TABLE IF NOT EXISTS "vehicle_telemetry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vehicle_id" varchar(100) NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"speed" integer,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "vehicle_telemetry" ADD CONSTRAINT "vehicle_telemetry_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "vehicle_telemetry" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON "vehicle_telemetry"
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
