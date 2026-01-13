import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Singleton pattern for Next.js hot-reloading
export const db = drizzle(pool, { schema });

// Export the raw pool for manual transactions if needed
export { pool };
