/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { chromium, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../visual-qa-results');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('=== Starting Automated Browser Walkthrough via Playwright ===');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    {
      name: 'desktop',
      width: 1280,
      height: 800,
      isMobile: false,
    },
    {
      name: 'mobile',
      width: 390,
      height: 844,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
    }
  ];

  const report = {
    screenshots: [],
    consoleLogs: [],
    errors: []
  };

  for (const vp of viewports) {
    console.log(`\n--- Running walkthrough on ${vp.name.toUpperCase()} viewport ---`);
    
    // Create an isolated context for each viewport to avoid shared sessions/cookies between viewports
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.userAgent,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile
    });

    const page = await context.newPage();

    // Listen to console logs
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        report.consoleLogs.push(`[${vp.name}] ${type.toUpperCase()}: ${text}`);
        console.log(`[Browser Console ${type}] ${text}`);
      }
    });

    page.on('pageerror', err => {
      report.errors.push(`[${vp.name}] Page Error: ${err.message}`);
      console.error(`[Browser Page Error] ${err.message}`);
    });

    try {
      // --- STEP 1: LOGIN PORTAL ---
      console.log(`[${vp.name}] Navigating to /login...`);
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      
      // Save screenshot of Login Page
      const loginPath = path.join(screenshotDir, `login-${vp.name}.png`);
      await page.screenshot({ path: loginPath, fullPage: true });
      report.screenshots.push({ name: `Login Page (${vp.name})`, path: loginPath });
      console.log(`[${vp.name}] Saved login screenshot.`);

      // Log in as Player
      console.log(`[${vp.name}] Logging in as Player...`);
      await page.fill('input[id="email"]', 'player@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to Map (home page)
      await page.waitForURL('http://localhost:3000/', { timeout: 8000 });
      console.log(`[${vp.name}] Logged in successfully, redirected to Map.`);

      // --- STEP 2: ONBOARDING PAGE ---
      console.log(`[${vp.name}] Navigating to /onboarding...`);
      await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });
      
      // Save screenshot of Onboarding Page
      const onboardingPath = path.join(screenshotDir, `onboarding-${vp.name}.png`);
      await page.screenshot({ path: onboardingPath, fullPage: true });
      report.screenshots.push({ name: `Onboarding Page (${vp.name})`, path: onboardingPath });
      console.log(`[${vp.name}] Saved onboarding screenshot.`);

      // Go back to map
      console.log(`[${vp.name}] Going back to Map...`);
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

      // --- STEP 3: FAVORITES FLOW ---
      // Open Quick View Card for Orcs Stories
      console.log(`[${vp.name}] Selecting Orcs Stories from sidebar...`);
      await page.click('[data-testid="venue-list"] >> text=Orcs Stories');
      
      // Wait for Quick View Card to be visible
      console.log(`[${vp.name}] Waiting for Quick View Card...`);
      await page.waitForSelector('[data-testid="quick-view-card"]', { timeout: 5000 });
      
      // Click "Favorito ⭐"
      // Let's locate the favorite button. In QuickViewCard, it has text "Favorito ⭐" or similar.
      // Let's find the button containing "Favorito" and click it.
      const favButton = page.locator('button:has-text("Favorito")');
      await page.waitForTimeout(500); // Small wait to let Leaflet settle
      
      // Take screenshot of Quick View Card
      const qvPath = path.join(screenshotDir, `quickview-${vp.name}.png`);
      await page.screenshot({ path: qvPath });
      report.screenshots.push({ name: `Quick View Card (${vp.name})`, path: qvPath });
      
      console.log(`[${vp.name}] Clicking Favorito button...`);
      await favButton.click();
      
      // Wait for favorited state (the button text might change to indicate it's favorited)
      await page.waitForTimeout(1000);

      // Verify in Profile Page
      console.log(`[${vp.name}] Navigating to /profile to verify favorites...`);
      await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });
      
      // Wait for favorite store to render in profile
      await page.waitForSelector('text=Mis Locales Favoritos', { timeout: 5000 });
      await page.waitForSelector('text=Orcs Stories', { timeout: 5000 });
      
      // Take profile screenshot
      const profilePath = path.join(screenshotDir, `profile-favorites-${vp.name}.png`);
      await page.screenshot({ path: profilePath, fullPage: true });
      report.screenshots.push({ name: `Player Profile Favorites (${vp.name})`, path: profilePath });
      console.log(`[${vp.name}] Verified favorites on profile page.`);

      // --- STEP 4: OWNER DASHBOARD & ANNOUNCEMENT ---
      console.log(`[${vp.name}] Logging out and logging in as Owner...`);
      // We can just go to /login and log in as partner@example.com
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      await page.fill('input[id="email"]', 'partner@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for Map redirect
      await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
      
      // Navigate to /dashboard
      console.log(`[${vp.name}] Navigating to Owner Dashboard...`);
      await page.goto('http://localhost:3000/dashboard?email=partner@example.com', { waitUntil: 'networkidle' });
      
      // Wait for dashboard content
      await page.waitForSelector('text=Portal del Propietario', { timeout: 5000 });
      await page.waitForSelector('text=Orcs Stories', { timeout: 5000 });
      
      // Write and post announcement
      console.log(`[${vp.name}] Writing store announcement...`);
      await page.fill('input[id="announcement-title"]', 'Torneo Especial Lorcana');
      await page.fill('textarea[id="announcement-content"]', 'Este sábado a las 16:00 tendremos torneo de Lorcana con pool extra.');
      
      // Screenshot owner dashboard before submit
      const ownerPath = path.join(screenshotDir, `owner-dashboard-${vp.name}.png`);
      await page.screenshot({ path: ownerPath, fullPage: true });
      report.screenshots.push({ name: `Owner Dashboard (${vp.name})`, path: ownerPath });

      console.log(`[${vp.name}] Submitting announcement...`);
      await page.click('button:has-text("Publicar")');
      
      // Wait for success message
      await page.waitForSelector('text=¡Anuncio publicado con éxito!', { timeout: 5000 });
      console.log(`[${vp.name}] Announcement posted successfully.`);

      // Navigate back to map to verify announcement in Quick View Card
      console.log(`[${vp.name}] Navigating back to Map to verify bulletin feed...`);
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      
      console.log(`[${vp.name}] Selecting Orcs Stories to open Quick View Card...`);
      await page.click('[data-testid="venue-list"] >> text=Orcs Stories');
      await page.waitForSelector('[data-testid="quick-view-card"]', { timeout: 5000 });
      
      // Wait for the announcement to render
      await page.waitForSelector('text=Torneo Especial Lorcana', { timeout: 5000 });
      await page.waitForSelector('text=Este sábado a las 16:00 tendremos torneo de Lorcana con pool extra.', { timeout: 5000 });
      
      // Take screenshot of Map bulletin feed
      const mapAnnPath = path.join(screenshotDir, `map-bulletin-feed-${vp.name}.png`);
      await page.screenshot({ path: mapAnnPath });
      report.screenshots.push({ name: `Map Bulletin Feed (${vp.name})`, path: mapAnnPath });
      console.log(`[${vp.name}] Verified bulletin feed on Map.`);

      // --- STEP 5: PLATFORM ADMIN DASHBOARD ---
      console.log(`[${vp.name}] Navigating to Platform Admin Dashboard...`);
      await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
      
      // Wait for admin dashboard content
      await page.waitForSelector('text=Panel de Control', { timeout: 5000 });
      
      // Take screenshot of admin dashboard
      const adminPath = path.join(screenshotDir, `admin-dashboard-${vp.name}.png`);
      await page.screenshot({ path: adminPath, fullPage: true });
      report.screenshots.push({ name: `Admin Dashboard (${vp.name})`, path: adminPath });
      console.log(`[${vp.name}] Verified Admin Dashboard.`);

    } catch (err) {
      console.error(`Error during ${vp.name} walkthrough:`, err);
      report.errors.push(`[${vp.name}] Execution Error: ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log('\n=== Walkthrough Finished ===');
  
  // Write report file
  const reportPath = path.join(screenshotDir, 'walkthrough-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to ${reportPath}`);
  
  console.log('\n--- Captured Screenshots ---');
  report.screenshots.forEach(s => {
    console.log(`- ${s.name}: ${s.path}`);
  });
}

run();
