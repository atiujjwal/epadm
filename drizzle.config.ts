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

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable");
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