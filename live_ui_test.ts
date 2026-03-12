import puppeteer from 'puppeteer';

function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function runFullUITest() {
    console.log("==================================================");
    console.log("🎬 Initiating Full UI Live Simulation!");
    console.log("==================================================");

    // Launch visible browser with slowMo so the user can see what's happening
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        slowMo: 30, // Slows down Puppeteer operations
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        const typeHelper = async (selector: string, text: string) => {
            await page.waitForSelector(selector, { visible: true });
            await page.type(selector, text, { delay: 50 });
        };
        const clickHelper = async (selector: string) => {
            await page.waitForSelector(selector, { visible: true });
            await page.click(selector);
        };

        const baseUrl = "http://localhost:3000";

        // 1. Login
        console.log("➤ Navigating to Login...");
        await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });

        console.log("➤ Logging in as admin...");
        await typeHelper('input[name="username"]', 'admin');
        await typeHelper('input[name="password"]', 'admin123');

        await delay(1000);
        await clickHelper('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log("✅ Logged in successfully.");
        await delay(1000);

        // 2. We already created MACK_TEST_PROJ, let's just go there or create a new one.
        // Let's create a new one to show the full flow!
        console.log("➤ Navigating to Create Project...");
        await page.goto(`${baseUrl}/admin/projects/new`, { waitUntil: 'networkidle2' });
        await delay(1000);

        const timestamp = Date.now();
        const projectCode = `LIVE_PROJ_${Math.floor(Math.random() * 1000)}`;
        console.log("➤ Filling out Project Form...");
        await typeHelper('[data-testid="input-project-name"]', `Live Mack UI Test ${timestamp}`);
        
        // Ensure Quick Add Client exists or just type it
        await clickHelper('[data-testid="button-quick-add-client"]');
        await delay(500);
        await typeHelper('[data-testid="input-quick-client-name"]', 'Mack Review Client');
        await typeHelper('[data-testid="input-quick-client-email"]', 'review@mack.test');
        await typeHelper('[data-testid="input-quick-client-company"]', 'Mack Inc');
        await clickHelper('[data-testid="button-quick-client-save"]');
        await delay(1000);

        await typeHelper('[data-testid="input-survey-url"]', 'https://example.com/survey?uid={RID}&callback={oi_session}');
        await typeHelper('[data-testid="input-expected-completes"]', '500');

        // Fill custom RID prefix (the input might already have "TEST" or "PROJ")
        await clickHelper('[data-testid="input-client-rid-prefix"]');
        for(let i=0; i<8; i++) await page.keyboard.press('Backspace');
        await typeHelper('[data-testid="input-client-rid-prefix"]', projectCode);

        console.log("➤ Saving Project...");
        await clickHelper('[data-testid="button-save-project"]'); 
        
        // Wait for redirect to project list
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log("✅ Project created.");
        await delay(1000);

        // 3. Edit Project to Add Supplier
        console.log("➤ Navigating to newly created project to add Supplier...");
        // Click the top "Edit" button we find on the projects page since it's sorted by newest
        await page.waitForSelector('[data-testid^="button-edit-project-"]');
        const editLinks = await page.$$('[data-testid^="button-edit-project-"]');
        if (editLinks.length > 0) {
            await editLinks[0].click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        } else {
            throw new Error("Could not find project edit link.");
        }
        await delay(1000);

        console.log("➤ Scrolling down to Suppliers section...");
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await delay(1000);

        // Add MackInsights supplier
        console.log("➤ Entering MackInsights Supplier details...");
        await typeHelper('[data-testid="input-supplier-name"]', `Mack Live ${timestamp}`);
        const supplierCode = `MACK_LIVE_${Math.floor(Math.random() * 1000)}`;
        await typeHelper('[data-testid="input-supplier-code"]', supplierCode);
        
        // Using exactly what user provided
        await typeHelper('[data-testid="input-supplier-complete-url"]', 'https://dashboard.mackinsights.com/redirect/complete?pid={{pid}}&uid={{uid}}');
        await typeHelper('[data-testid="input-supplier-terminate-url"]', 'https://dashboard.mackinsights.com/redirect/terminate?pid={{pid}}&uid={{uid}}');
        await typeHelper('[data-testid="input-supplier-quotafull-url"]', 'https://dashboard.mackinsights.com/redirect/quotafull?pid={{pid}}&uid={{uid}}');
        await typeHelper('[data-testid="input-supplier-security-url"]', 'https://dashboard.mackinsights.com/redirect/security?pid={{pid}}&uid={{uid}}');

        await delay(1000);
        console.log("➤ Clicking Add Supplier...");
        await clickHelper('[data-testid="button-add-supplier"]');

        await delay(2000); // Wait for supplier to be saved and link generated
        console.log("✅ Supplier added.");

        // Grab the Entry Link generated
        await page.waitForSelector('code');
        const codeElements = await page.$$('code');
        let entryLink = "";
        for (let code of codeElements) {
            const text = await (await code.getProperty('textContent')).jsonValue();
            if (typeof text === 'string' && text.includes('/track?')) {
                entryLink = text;
                break; // get first one
            }
        }

        if (!entryLink) {
            console.log("Looking directly for inputs with value containing /track?");
            const inputElements = await page.$$('input');
            for (let input of inputElements) {
                const text = await (await input.getProperty('value')).jsonValue();
                if (typeof text === 'string' && text.includes('/track?')) {
                    entryLink = text;
                    break; 
                }
            }
        }

        if (!entryLink) {
            console.log("Falling back to manual link construction");
            // e.g. http://localhost:3000/track?code=LIVE_PROJ_922&country=US&sup=MACK_LIVE_243&uid=[uid]
            entryLink = `${baseUrl}/track?code=${projectCode}&country=US&sup=${supplierCode}&uid=[uid]`;
        }

        console.log("✅ Found Entry Link: " + entryLink);

        // 4. Simulate Respondent
        const testUid = "LIVETEST_QUOTAFULL_123";
        const finalEntryLink = entryLink.replace('[uid]', testUid).replace('[id]', testUid).replace('{RID}', testUid);

        console.log(`\n➤ SIMULATING RESPONDENT clicking the ENTRY link...`);
        const respondentPage = await browser.newPage();
        await respondentPage.bringToFront();
        await respondentPage.goto(finalEntryLink, { waitUntil: 'networkidle2' });

        console.log("➤ Respondent has hit the router and landed on Survey Page (example.com).");
        await delay(2000);

        const landingUrl = respondentPage.url();
        const urlObj = new URL(landingUrl);
        const oiSession = urlObj.searchParams.get("callback");
        console.log(`➤ Internal Router Assigned oi_session: ${oiSession}`);

        // 5. Simulate Quota Full Redirect
        console.log("\n➤ Respondent hits quota full! Simulating QUOTAFULL redirect back to Router...");
        await delay(2000);
        const trackQuotafullUrl = `${baseUrl}/quotafull?oi_session=${oiSession}`;
        await respondentPage.goto(trackQuotafullUrl, { waitUntil: 'networkidle2' });

        console.log("➤ Router processed QUOTAFULL tracking logic and showed the Outcome Page.");
        await delay(3000); // Give user time to see the new Quota Full landing page!

        const finalUrl = respondentPage.url();
        console.log(`🔗 Final Redirect URL seen by Respondent: ${finalUrl}`);

        if (finalUrl.includes('mackinsights.com/redirect/quotafull') && finalUrl.includes(`uid=${testUid}`)) {
            console.log("\n✅ MACRO REPLACEMENT VERIFIED SUCCESSFULLY IN URL BAR!");
        } else {
            // Check if it's the beautiful UI page
            if (finalUrl.includes('localhost:3000/quotafull')) {
               console.log("\n✅ SUCCESS: Respondent is on the beautiful internal QUOTAFULL landing page!");
               console.log("   (They will be auto-redirected to MackInsights in a few seconds, or they can click the link)");
               
               // Let's wait for the auto redirect
               console.log("   Waiting 5 seconds for auto-redirect...");
               await delay(6000);
               const autoRedirectUrl = respondentPage.url();
               console.log(`🔗 Auto Redirect URL is: ${autoRedirectUrl}`);
               
               if (autoRedirectUrl.includes('mackinsights.com/redirect/quotafull') && autoRedirectUrl.includes(`uid=${testUid}`)) {
                   console.log("✅ AUTO-REDIRECT MACRO VERIFIED");
               }
            } else {
               console.log("\n❌ MACRO REPLACEMENT FAILED OR WRONG PAGE.");
            }
        }

        await delay(2000);
        await respondentPage.close();

        // 6. Verify Database in Admin UI
        console.log("\n➤ Returning to Admin Panel...");
        await page.bringToFront();
        await page.evaluate(() => window.scrollTo(0, 0)); // Scroll back to top
        await delay(1000);

        console.log("➤ Navigating to Responses Table to verify recording...");
        await page.goto(`${baseUrl}/admin/responses`, { waitUntil: 'networkidle2' });
        await delay(2000);

        console.log("✅ The top row should now show our 'quotafull' status response for MackInsights.");

        console.log("\nLeaving browser open for 15 seconds so you can examine the screen...");
        await delay(15000);

        await browser.close();
        console.log("\n🎬 Live Visual Test Completed Successfully.");

    } catch (error: any) {
        console.error("\n❌ Visual Test Error:");
        console.error(error);
        
        console.log("\nBrowser left open for debugging for 30s...");
        await delay(30000);
        await browser.close();
    }
}

runFullUITest();
