
async function runTest() {
    const baseUrl = 'http://localhost:3000';
    const projectCode = 'MACK_TEST_PROJ';
    const supplierCode = 'MACK-VENDOR';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    if (!loginRes.ok) throw new Error('Login failed');
    const cookie = loginRes.headers.get('set-cookie');
    console.log('Logged in.');

    // 2. Create Supplier with MackInsights URL formats
    console.log('Ensuring MackInsights Supplier exists...');
    await fetch(`${baseUrl}/api/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            name: 'MackInsights Vendor',
            code: supplierCode,
            completeUrl: 'https://dashboard.mackinsights.com/redirect/complete?pid={{pid}}&uid={{uid}}',
            terminateUrl: 'https://dashboard.mackinsights.com/redirect/terminate?pid={{pid}}&uid={{uid}}',
            quotafullUrl: 'https://dashboard.mackinsights.com/redirect/quotafull?pid={{pid}}&uid={{uid}}',
            securityUrl: 'https://dashboard.mackinsights.com/redirect/security?pid={{pid}}&uid={{uid}}'
        })
    });

    // 3. Create Project
    console.log(`Ensuring Project ${projectCode} exists...`);
    const projRes = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            projectName: 'MackTest Project',
            projectCode: projectCode,
            client: 'MackInsights Client',
            status: 'active'
        })
    });
    let project;
    if (projRes.status === 201) {
        project = await projRes.json();
    } else {
        const listRes = await fetch(`${baseUrl}/api/projects`, { headers: { Cookie: cookie } });
        const projects = await listRes.json();
        project = projects.find(p => p.projectCode === projectCode);
    }

    // 4. Create Survey Mapping
    console.log('Ensuring US Survey Mapping exists...');
    await fetch(`${baseUrl}/api/projects/${project.id}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            countryCode: 'US',
            surveyUrl: 'https://client-survey.com/start?rid={RID}&callback={oi_session}',
            status: 'active',
            projectCode: projectCode
        })
    });

    const statuses = ['complete', 'terminate', 'quotafull'];

    for (const status of statuses) {
        console.log(`\n--- TESTING STATUS: ${status.toUpperCase()} ---`);
        const supplierRid = `MACK_USER_${status}_${Math.floor(Math.random() * 1000)}`;

        // Inbound Track
        console.log(`Step 1: Inbound Track (uid=${supplierRid})...`);
        const trackUrl = `${baseUrl}/track?code=${projectCode}&country=US&sup=${supplierCode}&uid=${supplierRid}`;
        const trackRes = await fetch(trackUrl, { redirect: 'manual' });
        const clientUrl = trackRes.headers.get('location');
        if (!clientUrl) throw new Error(`Track failed for ${status}`);

        const url = new URL(clientUrl);
        const oiSession = url.searchParams.get('callback');
        console.log(`Step 2: Extracted oi_session: ${oiSession}`);

        // Outbound Callback
        console.log(`Step 3: Simulating Client ${status} Callback...`);
        const cbUrl = `${baseUrl}/${status}?oi_session=${oiSession}`;
        const cbRes = await fetch(cbUrl, { redirect: 'manual' });
        const finalVendorUrl = cbRes.headers.get('location');
        console.log(`Step 4: Final Vendor Redirect: ${finalVendorUrl}`);

        // Validation
        const hasPid = finalVendorUrl.includes(`pid=${projectCode}`);
        const hasUid = finalVendorUrl.includes(`uid=${supplierRid}`);

        if (hasPid && hasUid) {
            console.log(`✅ SUCCESS: ${status} redirect correctly replaced all placeholders.`);
        } else {
            console.log(`❌ FAILURE: ${status} redirect missing pid or uid.`);
            console.log(`   Final URL was: ${finalVendorUrl}`);
        }
    }

    console.log('\n--- VERIFYING PERSISTENCE ---');
    const respRes = await fetch(`${baseUrl}/api/admin/responses?limit=5`, { headers: { Cookie: cookie } });
    const responses = await respRes.json();
    console.log(`Found ${responses.length} responses in DB/In-Memory storage.`);
    console.log('Test execution complete.');
}

runTest().catch(console.error);
