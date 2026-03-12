const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  testMatch: '**/auth-smoke.spec.js',
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run build:test && npm run serve:build',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});