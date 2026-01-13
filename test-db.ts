import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testConnection() {
  console.log("Environment variables:");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  console.log("\nAttempting to connect...\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL!");

    // Check PostgreSQL version
    const versionResult = await client.query("SELECT version()");
    console.log("\n📋 PostgreSQL Version:");
    console.log(versionResult.rows[0].version);

    // List databases
    const dbResult = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false"
    );
    console.log("\n📚 Available Databases:");
    dbResult.rows.forEach((row) => {
      console.log(`  - ${row.datname}`);
    });

    // Check current database
    const currentDbResult = await client.query("SELECT current_database()");
    console.log(
      "\n🎯 Current Database:",
      currentDbResult.rows[0].current_database
    );

    // List tables in current database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("\n📊 Tables in current database:");
    if (tablesResult.rows.length === 0) {
      console.log("  (No tables yet - ready for migration)");
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });
    }

    client.release();
    console.log("\n✅ Connection test completed successfully!");
  } catch (error) {
    console.error("\n❌ Connection failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

testConnection();
