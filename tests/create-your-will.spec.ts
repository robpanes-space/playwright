import { test, expect, Locator } from '@playwright/test';

test.describe('Create Your Will - Windows desktop UI', () => {
  test.setTimeout(180000);

  test('Get Started -> Family & Beneficiaries: "Yes" reveals partner fields', async ({ page }) => {
    await page.goto('/create-your-will/', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await page.waitForTimeout(3500);

    const form = page.locator('#gform_2');
    await expect(form).toBeAttached();

    await page.screenshot({ path: 'screenshots/01-get-started.png', fullPage: true });

    // Helper: current-step visible+enabled inputs on the Gravity Form
    const currentPage = () => form.locator('.gform_page:not([style*="display: none"])').first();

    // Fill first visible enabled text input for a given label match
    const fillByLabel = async (labelRegex: RegExp, value: string) => {
      const field = currentPage()
        .locator('.gfield')
        .filter({ has: page.locator('label, .gfield_label').filter({ hasText: labelRegex }) })
        .first()
        .locator('input:not([disabled]):visible, textarea:not([disabled]):visible')
        .first();
      await expect(field).toBeVisible({ timeout: 10000 });
      await field.fill(value);
    };

    await fillByLabel(/^\s*1?\.?\s*Name/i, 'Test');
    // Last name = second visible input inside Name gfield
    const nameField = currentPage()
      .locator('.gfield')
      .filter({ has: page.locator('label, .gfield_label').filter({ hasText: /Name/i }) })
      .first();
    const lastNameInput = nameField.locator('input:not([disabled]):visible').nth(1);
    if (await lastNameInput.isVisible().catch(() => false)) {
      await lastNameInput.fill('User');
    }

    // DOB
    const dob = currentPage().locator('input:not([disabled])[placeholder*="mm/dd/yyyy" i]:visible').first();
    if (await dob.isVisible().catch(() => false)) {
      await dob.fill('01/01/1980');
    }

    // Phone
    const phone = currentPage().locator('input:not([disabled])[type="tel"]:visible, input:not([disabled])[name*="phone" i]:visible').first();
    if (await phone.isVisible().catch(() => false)) {
      await phone.fill('(555) 555-1212');
    }

    // Email
    const email = currentPage().locator('input:not([disabled])[type="email"]:visible').first();
    await email.fill('test.user+playwright@example.com');

    await page.screenshot({ path: 'screenshots/02-get-started-filled.png', fullPage: true });

    // Save and Continue
    const nextBtn = form.locator('input[type="button"][value*="Save and Continue" i], input[type="submit"][value*="Save and Continue" i], button:has-text("Save and Continue")').first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Wait for step 2
    await page.waitForTimeout(2500);

    const marriedQ = page
      .locator('.gfield')
      .filter({ hasText: /married or have a (domestic )?partner/i })
      .first();
    await expect(marriedQ).toBeVisible({ timeout: 20000 });
    await marriedQ.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/03-family-before-yes.png', fullPage: true });

    const beforeInputs = await page.locator('input:visible:not([disabled])').count();

    // Click "Yes" radio label inside the married question
    const yesLabel = marriedQ.locator('label').filter({ hasText: /^\s*Yes\s*$/ }).first();
    await expect(yesLabel).toBeVisible({ timeout: 10000 });
    await yesLabel.click();

    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/04-family-after-yes.png', fullPage: true });

    const afterInputs = await page.locator('input:visible:not([disabled])').count();
    console.log(JSON.stringify({ beforeInputs, afterInputs }));

    expect(afterInputs).toBeGreaterThan(beforeInputs);
  });
});
