import * as dotenv from "dotenv";
import * as path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import {
  parseDatabaseUrl,
  redactDatabaseUrl,
} from "./lib/database-url";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "drizzle");

async function ensureDatabaseExists(
  adminPool: Pool,
  databaseName: string,
): Promise<void> {
  const result = await adminPool.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
    [databaseName],
  );

  const exists = result.rows[0]?.exists ?? false;

  if (exists) {
    console.log(`[db:boot] Database "${databaseName}" already exists.`);
    return;
  }

  const escapedName = databaseName.replace(/"/g, '""');
  await adminPool.query(`CREATE DATABASE "${escapedName}"`);
  console.log(`[db:boot] Created database "${databaseName}".`);
}

async function runMigrations(targetPool: Pool): Promise<void> {
  const db = drizzle(targetPool);
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log(`[db:boot] Applied migrations from ${MIGRATIONS_FOLDER}`);
}

async function verifyConnection(targetPool: Pool): Promise<void> {
  const result = await targetPool.query<{ ok: number }>("SELECT 1 AS ok");

  if (result.rows[0]?.ok !== 1) {
    throw new Error("Health check failed: SELECT 1 did not return expected result.");
  }

  console.log("[db:boot] Health check passed (SELECT 1).");
}

async function bootstrap(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const parsed = parseDatabaseUrl(databaseUrl);

  console.log("[db:boot] Starting database bootstrap...");
  console.log(`[db:boot] Target: ${redactDatabaseUrl(parsed.targetConnectionString)}`);
  console.log(`[db:boot] Admin:  ${redactDatabaseUrl(parsed.adminConnectionString)}`);

  const adminPool = new Pool({
    connectionString: parsed.adminConnectionString,
    max: 1,
  });

  const targetPool = new Pool({
    connectionString: parsed.targetConnectionString,
    max: 1,
  });

  try {
    console.log("[db:boot] Step 1/3 — provisioning database (idempotent)...");
    await ensureDatabaseExists(adminPool, parsed.database);

    console.log("[db:boot] Step 2/3 — applying Drizzle migrations...");
    await runMigrations(targetPool);

    console.log("[db:boot] Step 3/3 — running connection health check...");
    await verifyConnection(targetPool);

    console.log(
      `[db:boot] Success — database "${parsed.database}" is provisioned, migrated, and reachable.`,
    );
  } finally {
    await adminPool.end().catch(() => undefined);
    await targetPool.end().catch(() => undefined);
  }
}

bootstrap().catch((error: unknown) => {
  console.error("[db:boot] Bootstrap failed.");

  if (error instanceof Error) {
    console.error(`[db:boot] ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(error);
  }

  process.exit(1);
});
