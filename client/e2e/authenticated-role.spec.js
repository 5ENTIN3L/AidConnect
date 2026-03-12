/* eslint-disable testing-library/prefer-screen-queries */
const { test, expect } = require('@playwright/test');

const requiredEnv = [
  'E2E_STAFF_EMAIL',
  'E2E_STAFF_PASSWORD',
  'REACT_APP_APPWRITE_ENDPOINT',
  'REACT_APP_APPWRITE_PROJECT_ID',
];

const missing = requiredEnv.filter((name) => !process.env[name]);

test.describe('AidConnect authenticated role smoke', () => {
  if (missing.length > 0) {
    test('staff login reaches protected navigation (missing env)', async () => {
      test.skip(`Missing env vars: ${missing.join(', ')}`);
    });
    return;
  }

  test('staff login reaches protected navigation', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByPlaceholder('your@email.com').fill(process.env.E2E_STAFF_EMAIL);
    await page.getByPlaceholder('••••••••').fill(process.env.E2E_STAFF_PASSWORD);
    await page.getByRole('button', { name: 'Sign In as Staff' }).click();

    await expect(page.getByText('AidConnect').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();
  });
});
