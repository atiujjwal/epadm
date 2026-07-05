import * as dotenv from "dotenv";
import * as path from "path";
import { eq } from "drizzle-orm";
import { generateTotpSecret, getTotpUri } from "../src/lib/platform/auth/mfa";
import { opsDb, platformOperators } from "../src/lib/db/ops";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function resetMfa() {
  const email = process.argv[2] || process.env.SEED_PLATFORM_EMAIL || "admin";
  const action = process.argv[3] || "enable"; // "enable" | "disable"

  console.log(`Locating platform operator: ${email}...`);

  const operator = await opsDb.query.platformOperators.findFirst({
    where: eq(platformOperators.email, email),
  });

  if (!operator) {
    console.error(`Error: Platform operator with email "${email}" not found.`);
    process.exit(1);
  }

  if (action === "disable") {
    await opsDb
      .update(platformOperators)
      .set({
        mfaEnabled: false,
        totpSecret: null,
      })
      .where(eq(platformOperators.id, operator.id));

    console.log(`\n=========================================`);
    console.log(`Success: MFA has been DISABLED for operator: ${email}`);
    console.log(`=========================================`);
  } else {
    const newSecret = generateTotpSecret();
    const uri = getTotpUri(email, newSecret);

    await opsDb
      .update(platformOperators)
      .set({
        mfaEnabled: true,
        totpSecret: newSecret,
      })
      .where(eq(platformOperators.id, operator.id));

    console.log(`\n=========================================`);
    console.log(`Success: MFA has been ENABLED for operator: ${email}`);
    console.log(`-----------------------------------------`);
    console.log(`MFA Secret Key: ${newSecret}`);
    console.log(`MFA URI Link:   ${uri}`);
    console.log(`=========================================`);
    console.log(`Scan the URI or type the secret key into Google Authenticator/Authy.`);
  }

  process.exit(0);
}

resetMfa().catch((err) => {
  console.error("Failed to reset MFA:", err);
  process.exit(1);
});
