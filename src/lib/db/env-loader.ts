import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
