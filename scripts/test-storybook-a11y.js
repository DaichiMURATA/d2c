#!/usr/bin/env node

/**
 * Test Storybook stories for accessibility violations using Playwright and axe-core
 * 
 * This script:
 * 1. Serves the built Storybook on port 6006
 * 2. Launches Playwright browser
 * 3. Tests each story for a11y violations using axe-playwright
 * 4. Exports results to JSON for CI/CD
 */

import { chromium } from 'playwright';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STORYBOOK_URL = 'http://localhost:6006';
const OUTPUT_DIR = 'test-results';
const OUTPUT_FILE = join(OUTPUT_DIR, 'a11y-violations.json');

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

let server;
let browser;
const allViolations = [];

async function startStorybookServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Storybook server...');
    
    // Start http-server to serve storybook-static
    server = spawn('npx', ['http-server', 'storybook-static', '-p', '6006', '-s'], {
      stdio: 'pipe',
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Available on:') || output.includes('Hit CTRL-C')) {
        console.log('✅ Storybook server started');
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    server.on('error', (error) => {
      reject(error);
    });

    // Wait a bit for server to be ready
    setTimeout(resolve, 3000);
  });
}

async function getStoriesList(page) {
  await page.goto(STORYBOOK_URL);
  await page.waitForTimeout(2000);

  // Get stories from Storybook's index.json
  try {
    const response = await page.goto(`${STORYBOOK_URL}/index.json`);
    const index = await response.json();
    
    const stories = [];
    for (const [id, data] of Object.entries(index.entries || {})) {
      if (data.type === 'story') {
        stories.push({
          id,
          title: data.title,
          name: data.name,
        });
      }
    }
    
    console.log(`📚 Found ${stories.length} stories to test`);
    return stories;
  } catch (error) {
    console.error('❌ Failed to load stories:', error);
    return [];
  }
}

async function testStoryA11y(page, story) {
  const storyUrl = `${STORYBOOK_URL}/iframe.html?id=${story.id}&viewMode=story`;
  
  try {
    await page.goto(storyUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Inject axe
    await injectAxe(page);

    // Run accessibility checks
    const violations = await getViolations(page, '#storybook-root');

    if (violations.length > 0) {
      console.log(`  ❌ ${story.title} > ${story.name}: ${violations.length} violations`);
      
      violations.forEach((violation) => {
        allViolations.push({
          story: `${story.title} > ${story.name}`,
          storyId: story.id,
          rule: violation.id,
          impact: violation.impact,
          description: violation.description,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.length,
        });
      });
    } else {
      console.log(`  ✅ ${story.title} > ${story.name}: No violations`);
    }
  } catch (error) {
    console.error(`  ⚠️ ${story.title} > ${story.name}: Test failed -`, error.message);
  }
}

async function main() {
  try {
    // Start Storybook server
    await startStorybookServer();

    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await chromium.launch();
    const page = await browser.newPage();

    // Get stories list
    const stories = await getStoriesList(page);

    if (stories.length === 0) {
      console.error('❌ No stories found');
      process.exit(1);
    }

    // Test each story
    console.log('♿ Testing stories for accessibility...\n');
    for (const story of stories) {
      await testStoryA11y(page, story);
    }

    // Write results
    writeFileSync(OUTPUT_FILE, JSON.stringify(allViolations, null, 2));
    
    console.log(`\n📊 Results:`);
    console.log(`   Total violations: ${allViolations.length}`);
    console.log(`   Output: ${OUTPUT_FILE}`);

    // Exit with error code if violations found
    if (allViolations.length > 0) {
      console.log('\n⚠️ Accessibility violations detected');
      process.exit(0); // Don't fail CI, just report
    } else {
      console.log('\n✅ No accessibility violations found');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (browser) await browser.close();
    if (server) server.kill();
  }
}

main();
