import { test, expect } from '@playwright/test'
import path from 'path'

const RESULTS_DIR = path.join(__dirname, '../visual-qa-results')

test.describe('El Meeple Visual QA Spec', () => {
  test('homepage map, sidebar, and onboarding flows walkthrough', async ({ page }) => {
    // Mock Nominatim geocoding API to prevent external network calls and rate limits
    await page.route('**/nominatim.openstreetmap.org/search*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            lat: '19.4165',
            lon: '-99.1620',
            display_name: 'Chihuahua 142, Roma Nte, CDMX'
          }
        ])
      })
    })

    // 1. Navigate to Homepage (Desktop)
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(2000) // Wait for Leaflet map to fully load tiles

    // Take Desktop Homepage Screenshot
    await page.screenshot({ path: path.join(RESULTS_DIR, '01-desktop-homepage.png') })

    // 2. Click a map marker icon to open the Quick View Card
    // Leaflet markers are rendered as SVG/image icons with class 'leaflet-marker-icon'
    const marker = page.locator('.leaflet-marker-icon').first()
    await expect(marker).toBeVisible()
    await marker.click()
    await page.waitForTimeout(1000) // Wait for card slide-in animation

    // Take Desktop Quick View Card Screenshot
    await page.screenshot({ path: path.join(RESULTS_DIR, '02-desktop-quickview.png') })

    // 3. Test Viewport Responsiveness (Mobile)
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone viewport
    await page.waitForTimeout(1000)

    // Take Mobile Quick View (Brand card should be hidden, map & quickview visible)
    await page.screenshot({ path: path.join(RESULTS_DIR, '03-mobile-quickview.png') })

    // Close the quick view card
    const closeBtn = page.locator('button[aria-label="close-card"]')
    await closeBtn.click()
    await page.waitForTimeout(1000)

    // Take Mobile Brand Card restored screenshot
    await page.screenshot({ path: path.join(RESULTS_DIR, '04-mobile-brandcard-restored.png') })

    // 4. Onboarding Wizard Flow
    // Resize back to desktop to navigate
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.waitForTimeout(500)

    // Navigate to Onboarding
    const registerLink = page.locator('text=Registrar mi Local')
    await registerLink.click()
    await expect(page).toHaveURL(/.*onboarding/)
    await page.waitForTimeout(1000)

    // STEP 1: Owner Details
    await page.screenshot({ path: path.join(RESULTS_DIR, '05-onboarding-step1.png') })
    await page.fill('#ownerName', 'Jose Zapata')
    await page.fill('#ownerEmail', 'jose@elmeeple.com')
    await page.click('button:has-text("Siguiente")')
    await page.waitForTimeout(500)

    // STEP 2: Store Details & Logo Upload & Weekly Schedule
    await page.screenshot({ path: path.join(RESULTS_DIR, '06-onboarding-step2.png') })
    await page.fill('#name', 'Meeple Oasis CDMX')
    await page.selectOption('#type', 'hibrido')
    await page.fill('#description', 'Un oasis de juegos de mesa en la Roma.')
    await page.fill('#instagram', 'meeple_oasis')
    await page.fill('#discord', 'https://discord.gg/meepleoasis')

    // Click Lunes & Martes checkboxes to open hours
    await page.click('#day-checkbox-mon')
    await page.click('#day-checkbox-tue')

    // Click Siguiente
    await page.click('button:has-text("Siguiente")')
    await page.waitForTimeout(500)

    // STEP 3: Map Location with Address Search
    await page.screenshot({ path: path.join(RESULTS_DIR, '07-onboarding-step3.png') })
    // Type address and click Buscar
    await page.fill('input[placeholder*="Escribe una dirección"]', 'Chihuahua 142, Roma Nte, CDMX')
    await page.click('button:has-text("Buscar")')
    await page.waitForTimeout(1500) // Wait for geocoding fetch and map pan

    // Click Siguiente
    await page.click('button:has-text("Siguiente")')
    await page.waitForTimeout(500)

    // STEP 4: Specialties
    await page.screenshot({ path: path.join(RESULTS_DIR, '08-onboarding-step4.png') })
    // Click Eurogames and TCGs checkboxes
    await page.click('#tag-Eurogames')
    await page.click('#tag-TCGs')
    await page.click('button:has-text("Siguiente")')
    await page.waitForTimeout(500)

    // STEP 5: Summary
    await page.screenshot({ path: path.join(RESULTS_DIR, '09-onboarding-step5-summary.png') })
    // Click submit
    await page.click('button:has-text("Confirmar y Registrar")')
    await page.waitForTimeout(1500) // Wait for Server Action submit

    // SUCCESS SCREEN
    await page.screenshot({ path: path.join(RESULTS_DIR, '10-onboarding-success.png') })
  })
})
