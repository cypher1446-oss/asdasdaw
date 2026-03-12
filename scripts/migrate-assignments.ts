import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Creating supplier_assignments table...");
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS supplier_assignments (
      id SERIAL PRIMARY KEY,
      project_code TEXT NOT NULL,
      country_code TEXT NOT NULL,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
      generated_link TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(project_code, country_code, supplier_id)
    )
  `);
  
  console.log("✅ supplier_assignments table created successfully");
  process.exit(0);
}

migrate().catch(e => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
