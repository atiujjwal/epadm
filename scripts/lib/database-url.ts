export type ParsedDatabaseUrl = {
  database: string;
  targetConnectionString: string;
  adminConnectionString: string;
  host: string;
  port: string;
  user: string;
};

const SUPPORTED_SCHEMES = new Set(["postgres:", "postgresql:"]);

/**
 * Parses DATABASE_URL and derives an admin connection string that targets
 * the default `postgres` maintenance database on the same host.
 */
export function parseDatabaseUrl(rawUrl: string): ParsedDatabaseUrl {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid URL. Expected postgresql://user:pass@host:port/dbname",
    );
  }

  if (!SUPPORTED_SCHEMES.has(parsed.protocol)) {
    throw new Error(
      `DATABASE_URL protocol must be postgres:// or postgresql:// (got ${parsed.protocol})`,
    );
  }

  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

  if (!database) {
    throw new Error(
      "DATABASE_URL must include a database name (e.g. postgresql://user:pass@host:5432/epadm)",
    );
  }

  const admin = new URL(parsed.toString());
  admin.pathname = "/postgres";

  return {
    database,
    targetConnectionString: rawUrl,
    adminConnectionString: admin.toString(),
    host: parsed.hostname,
    port: parsed.port || "5432",
    user: decodeURIComponent(parsed.username),
  };
}

export function redactDatabaseUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.password) {
      parsed.password = "****";
    }
    return parsed.toString();
  } catch {
    return "<invalid DATABASE_URL>";
  }
}
