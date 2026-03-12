import pg from "pg";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const diagnosticDetails: any = {
    timestamp: new Date().toISOString(),
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      db_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : "none"
    }
  };

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }

    const { Pool } = pg;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: !process.env.DATABASE_URL.includes("localhost") ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });

    diagnosticDetails.step = "connecting";
    const client = await pool.connect();
    
    diagnosticDetails.step = "querying";
    const result = await client.query("SELECT NOW() as now, version()");
    client.release();

    res.status(200).json({
      status: "success",
      message: "Database connection successful.",
      data: result.rows[0],
      diagnosticDetails
    });
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message || "Database connectivity failed.",
      error_code: err.code,
      diagnostic_step: diagnosticDetails.step,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
    });
  }
}
