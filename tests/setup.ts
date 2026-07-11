import * as dotenv from "dotenv";
import * as path from "node:path";

// Mirror the loading order used by drizzle.config.ts / db-bootstrap.ts so tests
// see the same DATABASE_URL / OPS_DATABASE_URL the app and migrations use.
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
