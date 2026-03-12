/* eslint-disable testing-library/prefer-screen-queries */
const { test, expect } = require('@playwright/test');

test.describe('AidConnect unauthenticated flow', () => {
  test('opens landing page and navigates to login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('AidConnect').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In as Staff' })).toBeVisible();
  });

  test('shows validation when login is submitted empty', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Sign In as Staff' }).click();

    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });
});