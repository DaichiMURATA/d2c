/**
 * Chromatic + Playwright Configuration
 *
 * Dynamically generates baseURL from project.config.json
 *
 * Usage:
 *   # Local testing
 *   npx playwright test --config=chromatic.config.js
 *
 *   # Test specific branch
 *   SOURCE_URL=https://testbranch--myproject--myorg.aem.live npx playwright test --config=chromatic.config.js
 *
 *   # Upload to Chromatic
 *   npx chromatic --playwright
 */

import { defineConfig } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load project configuration
function loadProjectConfig() {
  const configPath = join(__dirname, 'config', 'project.config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  return config;
}

const config = loadProjectConfig();
const defaultBaseUrl = config.eds.baseUrls.live;

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Include only chromatic test files
  testMatch: /chromatic.*\.spec\.js/,

  // Global timeout
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  use: {
    // Base URL - from project.config.json or environment variable
    baseURL: process.env.SOURCE_URL || defaultBaseUrl,

    // Browser settings
    viewport: { width: 1280, height: 720 },

    // Trace and screenshot settings
    trace: 'retain-on-failure',
    screenshot: 'off', // Let Chromatic handle screenshots
    video: 'off',
  },

  // Report settings
  reporter: [
    ['list'],
  ],

  // Output directory - must be 'test-results' for Chromatic
  outputDir: 'test-results',
});
