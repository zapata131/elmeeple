/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../visual-qa-results-m4');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('=== Starting Milestone 4 Automated Browser Walkthrough via Playwright ===');
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
        console.log(`[Console ${type}] ${text}`);
      }
    });

    page.on('pageerror', err => {
      report.errors.push(`[${vp.name}] Page Error: ${err.message}`);
      console.error(`[Page Error] ${err.message}`);
    });

    try {
      // 1. LOGIN
      console.log(`[${vp.name}] Logging in as Player...`);
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      await page.fill('input[id="email"]', 'player@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to homepage map
      await page.waitForURL('http://localhost:3000/', { timeout: 8000 });
      console.log(`[${vp.name}] Login successful. Redirected to map.`);

      // 2. SEARCH BY GAME & CLICK PIN
      console.log(`[${vp.name}] Searching for "Scythe" in map search...`);
      const searchSelector = 'input[placeholder*="Buscar local o juego"]';
      await page.waitForSelector(searchSelector, { timeout: 5000 });
      await page.fill(searchSelector, 'Scythe');
      
      // Click the filtered marker for Orcs Stories
      console.log(`[${vp.name}] Clicking Orcs Stories map pin...`);
      const pinSelector = 'button[data-testid*="mock-marker"]';
      await page.waitForSelector(pinSelector, { timeout: 5000 });
      await page.click(pinSelector);

      // 3. VERIFY QUICK VIEW CTA & NAVIGATE TO PROFILE
      console.log(`[${vp.name}] Verifying Quick View Card CTA...`);
      const ctaSelector = 'a:has-text("Ver Perfil y Ludoteca")';
      await page.waitForSelector(ctaSelector, { timeout: 5000 });
      
      // Save screenshot of Quick View Card
      const qvcPath = path.join(screenshotDir, `quick-view-${vp.name}.png`);
      await page.screenshot({ path: qvcPath });
      report.screenshots.push({ name: `Quick View Card (${vp.name})`, path: qvcPath });
      
      // Click "Ver Perfil y Ludoteca ➔"
      console.log(`[${vp.name}] Clicking CTA to transition to dedicated store profile...`);
      await page.click(ctaSelector);

      // Wait for profile route to load
      await page.waitForURL('**/venue/orcs-stories', { timeout: 8000 });
      await page.waitForSelector('h1:has-text("Orcs Stories")', { timeout: 5000 });
      console.log(`[${vp.name}] Profile page loaded successfully: /venue/orcs-stories`);

      // Save screenshot of Store Profile Page
      const profilePath = path.join(screenshotDir, `profile-full-${vp.name}.png`);
      await page.screenshot({ path: profilePath, fullPage: true });
      report.screenshots.push({ name: `Store Profile Full (${vp.name})`, path: profilePath });

      // 4. INTERACT WITH CATALOG SEARCH
      console.log(`[${vp.name}] Testing local game catalog search...`);
      const catalogSearchSelector = 'input[placeholder*="Buscar juego por título"]';
      await page.fill(catalogSearchSelector, 'Catan');
      await page.waitForTimeout(500); // Let filter apply
      
      // Save screenshot of filtered catalog
      const filterPath = path.join(screenshotDir, `profile-catalog-filtered-${vp.name}.png`);
      await page.screenshot({ path: filterPath });
      report.screenshots.push({ name: `Catalog Search Catan (${vp.name})`, path: filterPath });

      // Clear search
      await page.fill(catalogSearchSelector, '');
      await page.waitForTimeout(500);

      // 5. WRITE AND SUBMIT REVIEW
      console.log(`[${vp.name}] Filling out and submitting a detailed review...`);
      
      // Enter comment
      const commentSelector = 'textarea[placeholder*="Comparte tu opinión"]';
      await page.fill(commentSelector, 'Excelente comida y mesas amplias para jugar euros pesados. ¡El café de especialidad es top!');

      // Select Star Rating 5 (click 5th star)
      const stars = await page.$$('button:has-text("★")');
      if (stars.length >= 5) {
        await stars[4].click();
      }

      // Click vibe tags "Café" and "Eurogames"
      const vibeCafe = page.locator('button', { hasText: /^Café$/ });
      const vibeEuros = page.locator('button', { hasText: /^Eurogames$/ });
      await vibeCafe.click();
      await vibeEuros.click();

      // Submit review
      console.log(`[${vp.name}] Clicking Publicar Reseña...`);
      await page.click('button:has-text("Publicar Reseña")');

      // Wait for the new review comment to appear in the community comments list
      await page.waitForSelector('text=¡El café de especialidad es top!', { timeout: 5000 });
      console.log(`[${vp.name}] Review submitted and verified in feed.`);

      // Save screenshot of updated review section
      const reviewsPath = path.join(screenshotDir, `profile-reviews-updated-${vp.name}.png`);
      await page.screenshot({ path: reviewsPath });
      report.screenshots.push({ name: `Reviews Feed Updated (${vp.name})`, path: reviewsPath });

    } catch (err) {
      console.error(`Error during walkthrough on ${vp.name}:`, err);
      report.errors.push(`[${vp.name}] Error: ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log('\n=== Walkthrough Finished ===');
  console.log(`Saved ${report.screenshots.length} screenshots to visual-qa-results-m4/`);
  console.log(`Errors: ${report.errors.length}`);
  
  if (report.errors.length > 0) {
    console.error('Walkthrough completed with errors.');
    process.exit(1);
  } else {
    console.log('Walkthrough completed successfully with 100% correctness!');
    process.exit(0);
  }
}

run();
