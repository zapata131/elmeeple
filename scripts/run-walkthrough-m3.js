/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../visual-qa-results');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('=== Starting Milestone 3 Automated Browser Walkthrough via Playwright ===');
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
    
    // ==========================================
    // PART 1: OWNER SYNCS BGG COLLECTION
    // ==========================================
    const ownerContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.userAgent,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile
    });

    const ownerPage = await ownerContext.newPage();

    // Listen to console logs in owner page
    ownerPage.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        report.consoleLogs.push(`[owner-${vp.name}] ${type.toUpperCase()}: ${text}`);
        console.log(`[Owner Console ${type}] ${text}`);
      }
    });

    ownerPage.on('pageerror', err => {
      report.errors.push(`[owner-${vp.name}] Page Error: ${err.message}`);
      console.error(`[Owner Page Error] ${err.message}`);
    });

    try {
      console.log(`[${vp.name}] Navigating to /login...`);
      await ownerPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      
      // Save screenshot of Login Page
      const loginPath = path.join(screenshotDir, `login-${vp.name}.png`);
      await ownerPage.screenshot({ path: loginPath, fullPage: true });
      report.screenshots.push({ name: `Login Page (${vp.name})`, path: loginPath });

      // Log in as Owner (partner)
      console.log(`[${vp.name}] Logging in as Owner (owner@example.com)...`);
      await ownerPage.fill('input[id="email"]', 'owner@example.com');
      await ownerPage.fill('input[id="password"]', 'password123');
      await ownerPage.click('button[type="submit"]');
      
      // Wait for redirect
      await ownerPage.waitForURL('http://localhost:3000/', { timeout: 8000 });
      
      // Navigate to /dashboard
      console.log(`[${vp.name}] Navigating to Owner Dashboard...`);
      await ownerPage.goto('http://localhost:3000/dashboard?email=owner@example.com', { waitUntil: 'networkidle' });
      
      // Wait for BGG form
      await ownerPage.waitForSelector('input[placeholder*="Usuario de BGG"]', { timeout: 5000 });
      
      // Enter BGG Username
      console.log(`[${vp.name}] Entering BGG username and syncing...`);
      await ownerPage.fill('input[placeholder*="Usuario de BGG"]', 'zapata131');
      
      // Click Sincronizar
      await ownerPage.click('button:has-text("Sincronizar")');
      
      // Wait for success message or sync grid to update
      await ownerPage.waitForSelector('text=¡Sincronización exitosa!', { timeout: 10000 });
      console.log(`[${vp.name}] BGG Sync completed successfully.`);
      
      // Take screenshot of Owner BGG Sync Gallery
      const syncGalleryPath = path.join(screenshotDir, `owner-bgg-sync-${vp.name}.png`);
      await ownerPage.screenshot({ path: syncGalleryPath, fullPage: true });
      report.screenshots.push({ name: `Owner BGG Sync Gallery (${vp.name})`, path: syncGalleryPath });
      console.log(`[${vp.name}] Saved owner BGG sync gallery screenshot.`);

    } catch (err) {
      console.error(`Error during owner walkthrough on ${vp.name}:`, err);
      report.errors.push(`[owner-${vp.name}] Error: ${err.message}`);
    } finally {
      await ownerContext.close();
    }

    // ==========================================
    // PART 2: PLAYER SEARCHES AND LEAVES REVIEW
    // ==========================================
    const playerContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.userAgent,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile
    });

    const playerPage = await playerContext.newPage();

    // Listen to console logs in player page
    playerPage.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        report.consoleLogs.push(`[player-${vp.name}] ${type.toUpperCase()}: ${text}`);
        console.log(`[Player Console ${type}] ${text}`);
      }
    });

    playerPage.on('pageerror', err => {
      report.errors.push(`[player-${vp.name}] Page Error: ${err.message}`);
      console.error(`[Player Page Error] ${err.message}`);
    });

    try {
      console.log(`[${vp.name}] Logging in as Player...`);
      await playerPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      await playerPage.fill('input[id="email"]', 'player@example.com');
      await playerPage.fill('input[id="password"]', 'password123');
      await playerPage.click('button[type="submit"]');
      
      // Wait for redirect to homepage map
      await playerPage.waitForURL('http://localhost:3000/', { timeout: 8000 });
      console.log(`[${vp.name}] Player logged in successfully.`);

      // Click 'Buscar juegos' tab/pill
      console.log(`[${vp.name}] Toggling search mode to games...`);
      await playerPage.click('button:has-text("Buscar juegos")');
      await playerPage.waitForTimeout(300);

      // Type game title 'Scythe' in search bar
      console.log(`[${vp.name}] Searching for game 'Scythe'...`);
      const searchInput = playerPage.locator('input[placeholder*="Buscar juegos"]');
      await searchInput.fill('Scythe');
      await playerPage.waitForTimeout(1000); // Wait for filtering to apply

      // Take screenshot of player search highlights
      const searchHighlightsPath = path.join(screenshotDir, `player-search-highlights-${vp.name}.png`);
      await playerPage.screenshot({ path: searchHighlightsPath });
      report.screenshots.push({ name: `Player Search Highlights (${vp.name})`, path: searchHighlightsPath });
      console.log(`[${vp.name}] Saved player search highlights screenshot.`);

      // Click Orcs Stories in sidebar to open Quick View Card
      console.log(`[${vp.name}] Opening Quick View Card for Orcs Stories...`);
      await playerPage.click('[data-testid="venue-list"] >> text=Orcs Stories');
      
      // Wait for Quick View Card
      await playerPage.waitForSelector('[data-testid="quick-view-card"]', { timeout: 5000 });
      
      // Transition to dedicated store profile
      console.log(`[${vp.name}] Transitioning to dedicated store profile...`);
      const ctaSelector = 'a:has-text("Ver Perfil y Ludoteca")';
      await playerPage.click(ctaSelector);
      await playerPage.waitForURL('**/venue/orcs-stories', { timeout: 8000 });
      await playerPage.waitForSelector('h1:has-text("Orcs Stories")', { timeout: 5000 });

      // Take screenshot of map visual games grid (now on profile page)
      const gamesGridPath = path.join(screenshotDir, `map-visual-games-grid-${vp.name}.png`);
      await playerPage.screenshot({ path: gamesGridPath });
      report.screenshots.push({ name: `Map Visual Games Grid (${vp.name})`, path: gamesGridPath });
      console.log(`[${vp.name}] Saved map visual games grid screenshot.`);

      // Fill out "Escribir Reseña" form
      console.log(`[${vp.name}] Filling out review form...`);
      
      if (vp.isMobile) {
        console.log(`[${vp.name}] Clicking Comunidad tab on mobile to reveal review form...`);
        await playerPage.click('button:has-text("Comunidad")');
        await playerPage.waitForTimeout(300);
      }
      
      // Click 5th star
      const stars = playerPage.locator('button:has-text("★")');
      if (await stars.count() >= 5) {
        await stars.nth(4).click(); // Click the 5th star
      }
      
      // Click vibe tags: Eurogames and Café
      const tagEuro = playerPage.locator('button', { hasText: /^Eurogames$/ });
      const tagCafe = playerPage.locator('button', { hasText: /^Café$/ });
      await tagEuro.click();
      await tagCafe.click();

      // Type comment
      await playerPage.fill('textarea[placeholder*="Comparte tu opinión"]', '¡Mi café de juegos favorito! Excelente ludoteca, mesas muy amplias y muy buen café.');
      
      // Take screenshot before submitting
      console.log(`[${vp.name}] Submitting review...`);
      await playerPage.click('button:has-text("Publicar Reseña")');
      
      // Wait for review to appear in the feed (we can wait for comment text)
      await playerPage.waitForSelector('text=¡Mi café de juegos favorito!', { timeout: 5000 });
      console.log(`[${vp.name}] Review submitted and verified in feed.`);
      
      // Take screenshot of submitted review with vibe bars
      const reviewVibeBarsPath = path.join(screenshotDir, `submitted-review-vibe-bars-${vp.name}.png`);
      await playerPage.screenshot({ path: reviewVibeBarsPath });
      report.screenshots.push({ name: `Submitted Review with Vibe Bars (${vp.name})`, path: reviewVibeBarsPath });
      console.log(`[${vp.name}] Saved submitted review with vibe bars screenshot.`);

    } catch (err) {
      console.error(`Error during player walkthrough on ${vp.name}:`, err);
      report.errors.push(`[player-${vp.name}] Error: ${err.message}`);
    } finally {
      await playerContext.close();
    }
  }

  await browser.close();
  console.log('\n=== Automated Browser Walkthrough Finished ===');
  
  // Save JSON report
  const reportPath = path.join(screenshotDir, 'walkthrough-report-m3.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to ${reportPath}`);
}

run();
