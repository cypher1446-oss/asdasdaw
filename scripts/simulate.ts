import { db } from "../server/db";
import { clients, suppliers, projects, countrySurveys, respondents } from "@shared/schema";

async function runSimulation() {
  console.log("Seeding dummy data for simulation...");

  // 1. Create a Client
  const [client] = await db.insert(clients).values({
    name: "Simulation Client",
    company: "SimuCorp",
    email: "sim@example.com"
  }).returning();
  console.log("✅ Created Client:", client.name);

  // 2. Create a Supplier
  const [supplier] = await db.insert(suppliers).values({
    name: "Simulation Supplier",
    code: "SIM_SUPP_" + Math.floor(Math.random() * 1000),
    completeUrl: "http://localhost:3000/api/supplier/complete?rid={RID}",
    terminateUrl: "http://localhost:3000/api/supplier/terminate?rid={RID}",
    quotafullUrl: "http://localhost:3000/api/supplier/qf?rid={RID}",
    securityUrl: "http://localhost:3000/api/supplier/sec?rid={RID}"
  }).returning();
  console.log("✅ Created Supplier:", supplier.name, `(${supplier.code})`);

  // 3. Create a Project
  const projectCode = "SIM-PROJ-" + Math.floor(Math.random() * 9000 + 1000);
  const [project] = await db.insert(projects).values({
    projectCode,
    projectName: "Simulation Test Project",
    client: client.name,
    status: "active",
    completeUrl: "http://localhost:3000/api/callback/complete",
    terminateUrl: "http://localhost:3000/api/callback/terminate",
    quotafullUrl: "http://localhost:3000/api/callback/quotafull",
    securityUrl: "http://localhost:3000/api/callback/security-terminate"
  }).returning();
  console.log("✅ Created Project:", project.projectCode);

  // 4. Create Country Survey
  const [survey] = await db.insert(countrySurveys).values({
    projectId: project.id,
    projectCode: project.projectCode,
    countryCode: "US",
    surveyUrl: "http://localhost:3000/dummy-client-survey?session={oi_session}&rid={RID}",
    status: "active"
  }).returning();
  console.log("✅ Created Country Survey (US) for", project.projectCode);

  console.log("\n--- Starting Respondent Simulation ---");

  // 5. Simulate Respondent Entry
  const entryUrl = `http://localhost:3000/track?code=${project.projectCode}&country=US&sup=${supplier.code}&uid=TEST_RID_12345`;
  console.log(`➡️ Hit routing URL: ${entryUrl}`);
  
  const response = await fetch(entryUrl, { redirect: 'manual' });
  
  if (response.status !== 302) {
    console.error("❌ Expected 302 redirect, got", response.status);
    process.exit(1);
  }

  const location = response.headers.get('location');
  console.log(`⬅️ Redirected to: ${location}`);

  if (!location) {
    console.error("❌ No location header found.");
    process.exit(1);
  }

  // Extract oi_session from location URL. The setup uses {oi_session} in the dummy URL
  const urlObj = new URL(location);
  const oiSession = urlObj.searchParams.get("session");
  
  if (!oiSession) {
    console.error("❌ Could not extract oi_session from redirect URL.");
    process.exit(1);
  }
  
  console.log(`✅ Extracted Session ID: ${oiSession}`);

  // 6. Simulate Client Survey Complete
  const completeUrl = `http://localhost:3000/api/callback/complete?uid=${oiSession}`;
  console.log(`➡️ Simulating survey completion callback: ${completeUrl}`);

  const completeResponse = await fetch(completeUrl, { redirect: 'manual' });
  console.log(`⬅️ Callback Response Status: ${completeResponse.status}`);
  
  const finalLocation = completeResponse.headers.get('location');
  console.log(`⬅️ Final Supplier Redirect: ${finalLocation}`);

  console.log("\n✅ Simulation Test Successfully Completed!");
  process.exit(0);
}

runSimulation().catch(err => {
  console.error(err);
  process.exit(1);
});
