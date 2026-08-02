import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ 
  path: path.resolve(process.cwd(), ".env.local"),
  override: true 
});

dotenv.config({ 
  path: path.resolve(process.cwd(), ".env")
});

// Runtime DATABASE_URL must stay on the restricted RLS role. DDL can use an
// explicitly configured owner connection without changing runtime credentials.
const connectionString =
  process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing MIGRATION_DATABASE_URL or DATABASE_URL environment variable");
}

console.log("Using database connection:", connectionString.replace(/:[^:@]+@/, ':****@'));

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;
