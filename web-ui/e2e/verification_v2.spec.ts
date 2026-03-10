import { test, expect } from '@playwright/test';

test('verify dashboard and game progress', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Dashboard screenshot for ICU tracker and support button
  await page.screenshot({ path: '/home/jules/verification/dashboard_v5.png' });

  // Click a measure
  await page.getByText('Roušky ve vnitřních prostorách').first().click();

  // Request support
  await page.getByRole('button', { name: '💰 Žádat o finanční podporu' }).click();

  // Advance turn - based on screenshot "0 / 12" and icon,
  // let's try to find a button with "Jednání" or "Další".
  const nextButton = page.locator('button:has-text("Jednání"), button:has-text("Další"), button:has-text("Spustit")').first();
  if (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/home/jules/verification/turn_1.png' });
  }
});
