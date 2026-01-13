// import { defineConfig } from "drizzle-kit";
// import * as dotenv from "dotenv";

// dotenv.config({ path: ".env" });

// console.log("Connecting to:", process.env.DATABASE_URL);

// export default defineConfig({
//   schema: "./src/domains/**/schema.ts",
//   out: "./src/lib/db/migrations",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
//   verbose: true,
//   strict: true,
// });

import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

console.log("Using database connection:", connectionString);

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
