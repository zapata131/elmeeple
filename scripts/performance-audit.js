const { chromium } = require('@playwright/test');

async function runAudit() {
  console.log('=== Starting Chrome DevTools Performance Audit ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Create CDPSession to communicate directly with Chromium DevTools
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');

  console.log('Navigating to http://localhost:3000/venue/orcs-stories ...');
  
  // Measure navigation timing
  const startTime = Date.now();
  await page.goto('http://localhost:3000/venue/orcs-stories', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;

  // Retrieve Chromium performance metrics
  const performanceMetrics = await client.send('Performance.getMetrics');
  
  // Retrieve Web Vitals via window.performance
  const timing = await page.evaluate(() => {
    const t = window.performance.timing;
    return {
      navigationStart: t.navigationStart,
      domLoading: t.domLoading - t.navigationStart,
      domInteractive: t.domInteractive - t.navigationStart,
      domContentLoadedEventEnd: t.domContentLoadedEventEnd - t.navigationStart,
      loadEventEnd: t.loadEventEnd - t.navigationStart,
    };
  });

  console.log('\n--- Performance Audit Results ---');
  console.log(`Page Load Time (Network Idle): ${loadTime} ms`);
  console.log(`DOM Loading Time: ${timing.domLoading} ms`);
  console.log(`DOM Interactive Time: ${timing.domInteractive} ms`);
  console.log(`DOM Content Loaded Time: ${timing.domContentLoadedEventEnd} ms`);
  console.log(`Full Page Load Event: ${timing.loadEventEnd} ms`);

  console.log('\n--- Chromium Engine Internal Metrics ---');
  const importantMetrics = ['Timestamp', 'Documents', 'Frames', 'JSEventListeners', 'LayoutObjects', 'Nodes', 'Resources', 'LayoutCount', 'RecalcStyleCount', 'JSHeapUsedSize', 'JSHeapTotalSize'];
  performanceMetrics.metrics.forEach(m => {
    if (importantMetrics.includes(m.name)) {
      let value = m.value;
      if (m.name.includes('Size')) {
        value = `${(m.value / 1024 / 1024).toFixed(2)} MB`;
      }
      console.log(`${m.name}: ${value}`);
    }
  });

  await browser.close();
  console.log('=== Performance Audit Completed ===');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
