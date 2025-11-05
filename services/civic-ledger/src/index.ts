import app from "./app.js";
import { runMigration } from "./utils/db.js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

// Run database migrations on startup
async function initializeDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      const migrationSQL = readFileSync(
        join(__dirname, "../migrations/001_initial_schema.sql"),
        "utf-8"
      );
      await runMigration(1, "001_initial_schema", migrationSQL);
      console.log("✅ Database migrations completed");
    } catch (error: any) {
      console.error("⚠️  Database migration failed:", error.message);
      // Continue anyway - service can run without DB for some endpoints
    }
  } else {
    console.log("⚠️  DATABASE_URL not set, skipping migrations");
  }
}

async function start() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🏛️  Civic Ledger running on port ${PORT}`);
    console.log(`   GET  /health`);
    console.log(`   GET  /system/health`);
    console.log(`   GET  /gi`);
    console.log(`   POST /convert/shards-to-credits`);
    console.log(`   POST /convert/credits-to-shards`);
    console.log(`   POST /attest/mint`);
    console.log(`   POST /attest/burn`);
    console.log(`   GET  /ubi/preview`);
    console.log(`   POST /ubi/preview`);
    console.log();
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   GI Warning Threshold: ${process.env.GI_FLOOR_WARN || "0.950"}`);
    console.log(`   GI Halt Threshold: ${process.env.GI_FLOOR_HALT || "0.900"}`);
  });
}

start().catch((error) => {
  console.error("Fatal error starting service:", error);
  process.exit(1);
});
