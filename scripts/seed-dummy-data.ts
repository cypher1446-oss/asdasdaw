import { db } from "../server/db";
import { clients, suppliers, projects, countrySurveys, respondents, activityLogs } from "@shared/schema";
import { randomUUID } from "crypto";

async function seedDummyData() {
  console.log("🌱 Seeding dummy data...\n");

  // ── 1. Client ──
  const [client] = await db.insert(clients).values({
    name: "Acme Research Corp",
    company: "Acme Research",
    email: "contact@acmeresearch.com",
  }).returning();
  console.log(`✅ Client: "${client.name}" (id=${client.id})`);

  // ── 2. Supplier ──
  const supplierCode = "CINT";
  const [supplier] = await db.insert(suppliers).values({
    name: "Cint Panel Supplier",
    code: supplierCode,
    completeUrl: "https://s.cint.com/Survey/Complete?RID={RID}",
    terminateUrl: "https://s.cint.com/Survey/Terminate?RID={RID}",
    quotafullUrl: "https://s.cint.com/Survey/QuotaFull?RID={RID}",
    securityUrl: "https://s.cint.com/Survey/SecurityTerminate?RID={RID}",
  }).returning();
  console.log(`✅ Supplier: "${supplier.name}" code=${supplier.code} (id=${supplier.id})`);

  // ── 3. Project ──
  const projectCode = "ACME-2026-001";
  const [project] = await db.insert(projects).values({
    projectCode,
    projectName: "Global Consumer Satisfaction Q1 2026",
    client: client.name,
    status: "active",
    ridPrefix: "ACM",
    ridCountryCode: "US",
    ridPadding: 5,
    ridCounter: 1,
    completeUrl: "https://acmeresearch.com/survey/complete",
    terminateUrl: "https://acmeresearch.com/survey/terminate",
    quotafullUrl: "https://acmeresearch.com/survey/quotafull",
    securityUrl: "https://acmeresearch.com/survey/security",
  }).returning();
  console.log(`✅ Project: "${project.projectName}" code=${project.projectCode} (id=${project.id})`);

  // ── 4. Country Surveys ──
  const countries = [
    { code: "US", url: "https://survey.acmeresearch.com/us?rid={RID}&session={oi_session}" },
    { code: "IN", url: "https://survey.acmeresearch.com/in?rid={RID}&session={oi_session}" },
    { code: "GB", url: "https://survey.acmeresearch.com/gb?rid={RID}&session={oi_session}" },
  ];

  for (const c of countries) {
    const [cs] = await db.insert(countrySurveys).values({
      projectId: project.id,
      projectCode: project.projectCode,
      countryCode: c.code,
      surveyUrl: c.url,
      status: "active",
    }).returning();
    console.log(`  ✅ Country Survey: ${cs.countryCode} → ${cs.surveyUrl.substring(0, 50)}...`);
  }

  // ── 5. Simulate 10 Respondents ──
  console.log(`\n📊 Creating 10 simulated respondent sessions...\n`);

  const statuses = ["complete", "complete", "complete", "complete", "complete",
                     "terminate", "terminate", "quotafull", "security_terminate", "started"];
  
  for (let i = 0; i < 10; i++) {
    const oiSession = randomUUID();
    const supplierRid = `CINT_RID_${1000 + i}`;
    const clientRid = `ACM-US-${String(i + 1).padStart(5, "0")}`;
    const status = statuses[i];
    const countryCode = i < 4 ? "US" : i < 7 ? "IN" : "GB";

    const [resp] = await db.insert(respondents).values({
      oiSession,
      projectCode,
      supplierCode,
      supplierRid,
      countryCode,
      clientRid,
      ipAddress: `192.168.1.${100 + i}`,
      userAgent: "Mozilla/5.0 (Simulation)",
      status,
      completedAt: status !== "started" ? new Date() : null,
    }).returning();

    // Activity log for entry
    await db.insert(activityLogs).values({
      projectCode,
      oiSession,
      eventType: "entry",
      meta: { details: `Respondent ${supplierRid} entered from ${supplierCode}` },
    });

    // Activity log for final status (if not still started)
    if (status !== "started") {
      await db.insert(activityLogs).values({
        projectCode,
        oiSession,
        eventType: status,
        meta: { details: `Respondent completed with status: ${status}` },
      });
    }

    const emoji = status === "complete" ? "🟢" :
                  status === "terminate" ? "🔴" :
                  status === "quotafull" ? "🟡" :
                  status === "security_terminate" ? "⛔" : "⏳";
    console.log(`  ${emoji} Respondent #${i + 1}: ${supplierRid} → ${status} (${countryCode})`);
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║           🎉 SEEDING COMPLETE!                   ║
╠══════════════════════════════════════════════════╣
║  Client:     Acme Research Corp                  ║
║  Supplier:   Cint Panel Supplier (CINT)          ║
║  Project:    ACME-2026-001                       ║
║  Countries:  US, IN, GB                          ║
║  Respondents: 10 (5 complete, 2 term, 1 QF,     ║
║               1 sec-term, 1 in-progress)         ║
╚══════════════════════════════════════════════════╝

🔗 Test the tracking URL in your browser:
   http://localhost:3000/track?code=ACME-2026-001&country=US&sup=CINT&uid=LIVE_TEST_001

🖥️  View admin dashboard at:
   http://localhost:3000/admin
`);

  process.exit(0);
}

seedDummyData().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
