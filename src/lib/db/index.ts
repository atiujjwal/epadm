import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Primary Postgres connection + Drizzle ORM instance.
 *
 * This will be the single entry point to the DB for the web app.
 * In future we can add a separate read-replica connection here if needed.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
  max: 10,
});

export const db = drizzle(pool, { schema });

export * from "./schema";

