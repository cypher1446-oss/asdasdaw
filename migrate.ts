import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    console.log("Running manual migrations...");
    await db.execute(sql`
      ALTER TABLE respondents 
      ADD COLUMN IF NOT EXISTS s2s_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS fraud_score DECIMAL(5,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS s2s_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS s2s_received_at TIMESTAMP;

      CREATE TABLE IF NOT EXISTS s2s_logs (
          id SERIAL PRIMARY KEY,
          oi_session VARCHAR(255),
          project_code VARCHAR(100),
          supplier_code VARCHAR(100),
          status VARCHAR(50), 
          ip_address VARCHAR(45),
          user_agent TEXT,
          payload JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_s2s_config (
          id SERIAL PRIMARY KEY,
          project_code VARCHAR(100) UNIQUE,
          s2s_secret VARCHAR(255) NOT NULL,
          require_s2s BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Manual migrations completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
