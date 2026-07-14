import { test, expect } from '@playwright/test';

test.describe('Create Your Will - Windows desktop UI', () => {
  test.setTimeout(180000);

  test('Get Started -> Family & Beneficiaries: "Yes" reveals partner fields', async ({ page }) => {
    await page.goto('/create-your-will/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(4000);

    await expect(page.locator('#gform_2')).toBeAttached();

    await page.screenshot({ path: 'screenshots/01-get-started.png', fullPage: true });

    // Page 1 has 2 name inputs sharing a placeholder about birth certificate.
    const nameInputs = page.locator(
      'input:not([disabled])[placeholder*="birth certificate" i]',
    );
    await expect(nameInputs.first()).toBeVisible({ timeout: 15000 });
    await nameInputs.nth(0).fill('Test');
    await nameInputs.nth(1).fill('User');

    // DOB — fill via keyboard then Escape to close jQuery UI datepicker
    const dob = page.locator('input:not([disabled])[placeholder*="mm/dd/yyyy" i]').first();
    if (await dob.isVisible().catch(() => false)) {
      await dob.click();
      await page.keyboard.type('01/01/1980');
      await page.keyboard.press('Escape');
    }

    // Phone
    const phone = page
      .locator('input:not([disabled])[type="tel"], input:not([disabled])[name*="phone" i]')
      .first();
    if (await phone.isVisible().catch(() => false)) {
      await phone.fill('5555551212');
    }

    // Email — click first so focus is on the right field, then type with delay.
    const emailInput = page.locator('input:not([disabled])[type="email"]').first();
    await emailInput.click();
    await emailInput.press('Control+A');
    await emailInput.press('Delete');
    await emailInput.pressSequentially('qa.playwright@gmail.com', { delay: 50 });
    await emailInput.press('Tab');

    await page.screenshot({ path: 'screenshots/02-get-started-filled.png', fullPage: true });

    // Save and Continue
    const nextBtn = page.locator('#gform_2 input[value*="Save and Continue" i]:not([disabled])').first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.scrollIntoViewIfNeeded();
    await nextBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/02b-after-continue.png', fullPage: true });

    // Step 2: find and scroll to the married question
    const marriedQ = page
      .locator('.gfield')
      .filter({ hasText: /married or have a (domestic )?partner/i });

    // Wait until a *visible* married question fieldset appears
    await expect(async () => {
      const count = await marriedQ.count();
      let anyVisible = false;
      for (let i = 0; i < count; i++) {
        if (await marriedQ.nth(i).isVisible()) {
          anyVisible = true;
          break;
        }
      }
      expect(anyVisible).toBe(true);
    }).toPass({ timeout: 30000 });

    // Pick the visible one
    let visibleMarried = marriedQ.first();
    const total = await marriedQ.count();
    for (let i = 0; i < total; i++) {
      if (await marriedQ.nth(i).isVisible()) {
        visibleMarried = marriedQ.nth(i);
        break;
      }
    }

    await visibleMarried.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/03-family-before-yes.png', fullPage: true });

    const beforeInputs = await page.locator('input:visible:not([disabled])').count();

    // Click Yes label within that fieldset
    const yesLabel = visibleMarried.locator('label').filter({ hasText: /^\s*Yes\s*$/ }).first();
    await expect(yesLabel).toBeVisible({ timeout: 10000 });
    await yesLabel.click();

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/04-family-after-yes.png', fullPage: true });

    const afterInputs = await page.locator('input:visible:not([disabled])').count();
    console.log(JSON.stringify({ beforeInputs, afterInputs }));

    expect(afterInputs).toBeGreaterThan(beforeInputs);
  });
});
