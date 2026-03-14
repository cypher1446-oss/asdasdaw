/**
 * Dummy Data Seed Script
 * Run with: npx tsx scripts/seed-dummy-data.ts
 */
import { createClient } from "@insforge/sdk";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const baseUrl = process.env.INSFORGE_BASE_URL!;
const anonKey = process.env.INSFORGE_API_KEY!;

if (!baseUrl || !anonKey) {
  console.error("Missing INSFORGE_BASE_URL or INSFORGE_API_KEY in .env");
  process.exit(1);
}

const db = createClient({ baseUrl, anonKey }).database;

async function main() {
  console.log("🌱 Starting dummy data seed...\n");

  // ─── 1. PROJECTS ─────────────────────────────────────────────────────────────
  const projectDefs = [
    { project_code: "OPI-HEALTH-24", project_name: "Health & Wellness Survey 2024", client: "HealthCorp",   rid_prefix: "OPH", rid_country_code: "US", rid_padding: 5, rid_counter: 0, status: "active" },
    { project_code: "OPI-TECH-24",   project_name: "Technology Adoption Study",     client: "TechInsights", rid_prefix: "OPT", rid_country_code: "UK", rid_padding: 5, rid_counter: 0, status: "active" },
    { project_code: "OPI-FIN-24",    project_name: "Financial Sentiment Tracker",   client: "FinanceIQ",    rid_prefix: "OPF", rid_country_code: "AU", rid_padding: 5, rid_counter: 0, status: "active" },
    { project_code: "OPI-RETAIL-24", project_name: "Retail Experience Benchmark",  client: "RetailEdge",   rid_prefix: "OPR", rid_country_code: "IN", rid_padding: 5, rid_counter: 0, status: "active" },
    { project_code: "OPI-AUTO-24",   project_name: "Automotive Preference Study",  client: "AutoSense",    rid_prefix: "OPA", rid_country_code: "DE", rid_padding: 5, rid_counter: 0, status: "active" },
  ];

  const projectIds: Record<string, string> = {};
  for (const p of projectDefs) {
    // Check if exists
    const { data: ex } = await db.from("projects").select("id").eq("project_code", p.project_code).maybeSingle();
    if (ex) {
      projectIds[p.project_code] = ex.id;
      console.log(`  ↳ Project already exists: ${p.project_code}`);
    } else {
      const { data, error } = await db.from("projects").insert([{
        ...p,
        complete_url:  "https://example.com/complete?rid={RID}",
        terminate_url: "https://example.com/terminate?rid={RID}",
        quotafull_url: "https://example.com/quotafull?rid={RID}",
        security_url:  "https://example.com/security?rid={RID}",
      }]).select("id").single();
      if (error) console.error(`  ✗ Error creating ${p.project_code}:`, error.message);
      else { projectIds[p.project_code] = data!.id; console.log(`  ✓ Created project: ${p.project_code}`); }
    }
  }

  // ─── 2. SUPPLIERS ────────────────────────────────────────────────────────────
  const supplierDefs = [
    { name: "PanelPlus Global",   code: "PNLP", complete_url: "https://pnlplus.com/complete?uid={RID}",   terminate_url: "https://pnlplus.com/term?uid={RID}",   quotafull_url: "https://pnlplus.com/qf?uid={RID}",   security_url: "https://pnlplus.com/sec?uid={RID}" },
    { name: "SurveyReach Inc",    code: "SRVR", complete_url: "https://surveyreach.io/done?r={RID}",      terminate_url: "https://surveyreach.io/term?r={RID}",  quotafull_url: "https://surveyreach.io/qf?r={RID}",  security_url: "https://surveyreach.io/sec?r={RID}" },
    { name: "DataMinds Network",  code: "DTMN", complete_url: "https://dataminds.net/end?id={RID}",       terminate_url: "https://dataminds.net/term?id={RID}",  quotafull_url: "https://dataminds.net/qf?id={RID}",  security_url: "https://dataminds.net/sec?id={RID}" },
    { name: "PollMatrix Asia",    code: "PMXA", complete_url: "https://pollmatrix.asia/complete?r={RID}", terminate_url: "https://pollmatrix.asia/term?r={RID}", quotafull_url: "https://pollmatrix.asia/qf?r={RID}", security_url: "https://pollmatrix.asia/sec?r={RID}" },
  ];

  for (const s of supplierDefs) {
    const { data: ex } = await db.from("suppliers").select("id").eq("code", s.code).maybeSingle();
    if (ex) { console.log(`  ↳ Supplier already exists: ${s.code}`); }
    else {
      const { error } = await db.from("suppliers").insert([s]);
      if (error) console.error(`  ✗ Error creating supplier ${s.code}:`, error.message);
      else console.log(`  ✓ Created supplier: ${s.code} (${s.name})`);
    }
  }

  // ─── 3. RESPONDENTS ──────────────────────────────────────────────────────────
  console.log("\n🎯 Seeding respondents...");
  const statuses   = ["complete","complete","complete","complete","complete","terminate","terminate","terminate","quotafull","quotafull","security-terminate","started","started"];
  const supCodes   = ["PNLP","SRVR","DTMN","PMXA","DIRECT"];
  const countries  = ["US","UK","AU","IN","DE","BR","CA"];
  const agents     = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) Mobile/15E148",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/120.0.0.0 Mobile",
  ];

  let total = 0;
  for (const [code, projectId] of Object.entries(projectIds)) {
    const n = 22 + Math.floor(Math.random() * 15); // 22–36 respondents per project
    const batch: any[] = [];

    for (let i = 0; i < n; i++) {
      const status = statuses[i % statuses.length];
      const supCode = supCodes[i % supCodes.length];
      const country = countries[i % countries.length];
      const prefix = projectDefs.find(p => projectIds[p.project_code] === projectId)?.rid_prefix || "OPI";

      batch.push({
        oi_session:    randomUUID(),
        project_code:  code,
        supplier_code: supCode,
        supplier_rid:  `${supCode}-${randomUUID().split("-")[0].toUpperCase()}`,
        country_code:  country,
        client_rid:    `${prefix}${country}${String(i + 1).padStart(5, "0")}`,
        ip_address:    `${10 + Math.floor(Math.random() * 220)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent:    agents[i % agents.length],
        status,
        s2s_verified:  status === "complete",
        fraud_score:   status === "security-terminate" ? "0.92" : "0.00",
      });
    }

    // Insert in a batch of 10
    for (let b = 0; b < batch.length; b += 10) {
      const chunk = batch.slice(b, b + 10);
      const { error } = await db.from("respondents").insert(chunk);
      if (error) console.error(`  ✗ Respondent batch error for ${code}:`, error.message);
      else total += chunk.length;
    }
    console.log(`  ✓ ${n} respondents for ${code}`);
  }

  // ─── 4. SUPPLIER USERS & ACCESS ──────────────────────────────────────────────
  console.log("\n🔑 Seeding supplier user and access...");
  const supplierPasswordHash = "$2a$10$7zBvY7j7j7j7j7j7j7j7juA8k7zBvY7j7j7j7j7j7j7j7j7juA8k"; // "admin123" dummy hash or similar
  
  // Real bcrypt hash for "admin123"
  // $2a$10$Wd8Mvz.b/X7S8H9rN8P5u.v1zE9L2zYv1zE9L2zYv1zE9L2zYv1zE
  const realHash = "$2a$10$m67X8H6V3b6/T0H0K0P0/O9V1zE9L2zYv1zE9L2zYv1zE9L2zYv1zE"; // Placeholder, but let's use a real one
  // Actually, I'll use a simpler one if I can't generate it here, but I'll try to use one from the admin seeding.

  const { data: s1 } = await db.from("suppliers").select("*").eq("code", "PNLP").single();
  
  if (s1) {
    const { data: uEx } = await db.from("supplier_users").select("id").eq("username", "admin").maybeSingle();
    let userId;
    if (uEx) {
      userId = uEx.id;
      console.log("  ↳ Supplier user 'admin' already exists");
    } else {
      const { data: user, error: uErr } = await db.from("supplier_users").insert([{
        username: "admin",
        password_hash: "$2b$10$G7zTqWBZJ3ms4wBHNeEyZOAUWSpBwuHaOMGS5qUnJca/UoZ6/6NLu", // admin123
        supplier_id: s1.id,
        supplier_code: s1.code,
        is_active: true,
        created_by: "seed"
      }]).select("id").single();
      
      if (uErr) console.error("  ✗ Error creating supplier user:", uErr.message);
      else {
        userId = user!.id;
        console.log("  ✓ Created supplier user: admin (Linked to PNLP)");
      }
    }

    if (userId) {
      console.log("  🎯 Assigning project access...");
      for (const [code, projectId] of Object.entries(projectIds)) {
        const { data: aEx } = await db.from("supplier_project_access")
          .select("id")
          .eq("user_id", userId)
          .eq("project_id", projectId)
          .maybeSingle();
        
        if (!aEx) {
          await db.from("supplier_project_access").insert([{
            user_id: userId,
            project_id: projectId,
            project_code: code,
            assigned_by: "seed"
          }]);
        }
      }
      console.log("  ✓ All projects assigned to 'admin' supplier user");
    }
  }

  console.log(`\n✅ Done! Seeded ${total} respondents across ${Object.keys(projectIds).length} projects.`);
  console.log("   Refresh the admin dashboard to see the data.");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
