const path = require('path');
const dotenv = require('dotenv');
const { defineConfig } = require('@playwright/test');

dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = defineConfig({
  testDir: './e2e',
  testMatch: '**/authenticated-*.spec.js',
  fullyParallel: false,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run build:test:real && npm run serve:build',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
