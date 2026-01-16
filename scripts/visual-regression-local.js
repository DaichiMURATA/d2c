#!/usr/bin/env node

/**
 * Local Visual Regression Testing (Chromatic-style)
 * 
 * Uses Playwright's built-in visual comparison feature
 * to perform local visual regression testing without external services.
 * 
 * Features:
 * - Automatic screenshot capture
 * - Pixel-by-pixel comparison
 * - Automatic diff image generation
 * - HTML report with side-by-side comparison
 * - Baseline management (Git-based)
 * 
 * Usage:
 *   node scripts/visual-regression-local.js --block=<block-name> --update-baseline
 */

import { chromium } from 'playwright';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STORYBOOK_URL = 'http://localhost:6006';
const SCREENSHOTS_DIR = join(__dirname, '..', '.visual-regression');
const BASELINE_DIR = join(SCREENSHOTS_DIR, 'baseline');
const ACTUAL_DIR = join(SCREENSHOTS_DIR, 'actual');
const DIFF_DIR = join(SCREENSHOTS_DIR, 'diff');

// Create directories if they don't exist
[BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Get all stories for a block
async function getStoriesForBlock(blockName) {
  const storiesPath = join(__dirname, '..', 'blocks', blockName, `${blockName}.stories.js`);
  
  if (!existsSync(storiesPath)) {
    throw new Error(`Stories file not found: ${storiesPath}`);
  }

  // Read stories file and extract story names
  // This is a simple implementation - could be improved with AST parsing
  const { default: storiesMeta, ...stories } = await import(storiesPath);
  
  return Object.keys(stories).filter(key => key !== '__esModule');
}

// Capture screenshot with Playwright
async function captureScreenshot(browser, blockName, storyName, outputPath) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2, // Retina
  });

  const storyUrl = `${STORYBOOK_URL}/iframe.html?id=blocks-${blockName}--${storyName}&viewMode=story`;

  try {
    await page.goto(storyUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000); // Wait for animations

    // Find block element
    const selector = `.${blockName}.block, .${blockName}, [data-block-name="${blockName}"]`;
    const element = await page.locator(selector).first();
    
    if (await element.count() > 0) {
      await element.screenshot({ path: outputPath });
    } else {
      await page.screenshot({ path: outputPath, fullPage: false });
    }

    await page.close();
  } catch (error) {
    await page.close();
    throw error;
  }
}

// Compare screenshots using Playwright's built-in comparison
async function compareScreenshots(baselinePath, actualPath, diffPath) {
  // Use pixelmatch for comparison (same as our existing implementation)
  const { PNG } = await import('pngjs');
  const pixelmatch = (await import('pixelmatch')).default;
  const { readFileSync, writeFileSync } = await import('fs');

  const img1 = PNG.sync.read(readFileSync(baselinePath));
  const img2 = PNG.sync.read(readFileSync(actualPath));

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  writeFileSync(diffPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;

  return { numDiffPixels, totalPixels, diffPercentage };
}

// Generate HTML report
function generateHTMLReport(results) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Regression Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { font-size: 28px; margin-bottom: 10px; }
    .summary { display: flex; gap: 20px; margin-top: 20px; }
    .stat { background: #f8f8f8; padding: 15px 20px; border-radius: 6px; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .result-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .result-card.pass { border-left: 4px solid #22c55e; }
    .result-card.fail { border-left: 4px solid #ef4444; }
    .result-header { padding: 20px; border-bottom: 1px solid #eee; }
    .result-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .result-diff { font-size: 14px; color: #666; }
    .result-images { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #eee; }
    .result-image { position: relative; background: white; }
    .result-image img { width: 100%; display: block; }
    .image-label { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .diff-full { grid-column: 1 / -1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Visual Regression Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <div class="summary">
      <div class="stat">
        <div class="stat-value">${results.length}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat">
        <div class="stat-value passed">${results.filter(r => r.passed).length}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat">
        <div class="stat-value failed">${results.filter(r => !r.passed).length}</div>
        <div class="stat-label">Failed</div>
      </div>
    </div>
  </div>

  <div class="result-grid">
    ${results.map(result => `
      <div class="result-card ${result.passed ? 'pass' : 'fail'}">
        <div class="result-header">
          <div class="result-title">${result.blockName} - ${result.storyName}</div>
          <div class="result-diff">
            ${result.passed ? '✅ Passed' : `❌ Failed (${result.diffPercentage.toFixed(2)}% different)`}
          </div>
        </div>
        <div class="result-images">
          <div class="result-image">
            <img src="../baseline/${result.blockName}-${result.storyName}.png" alt="Baseline">
            <div class="image-label">Baseline</div>
          </div>
          <div class="result-image">
            <img src="../actual/${result.blockName}-${result.storyName}.png" alt="Actual">
            <div class="image-label">Actual</div>
          </div>
          ${!result.passed ? `
            <div class="result-image diff-full">
              <img src="../diff/${result.blockName}-${result.storyName}.png" alt="Diff">
              <div class="image-label">Difference</div>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  return html;
}

async function runVisualRegression(blockName, updateBaseline = false) {
  console.log('🎨 Local Visual Regression Testing\n');
  console.log(`   Block: ${blockName}`);
  console.log(`   Mode: ${updateBaseline ? 'Update Baseline' : 'Compare'}\n`);

  // Check if Storybook is running
  try {
    const response = await fetch(STORYBOOK_URL);
    if (!response.ok) throw new Error();
  } catch {
    console.error(`❌ Storybook is not running at ${STORYBOOK_URL}`);
    console.log(`\n💡 Start Storybook first: npm run storybook\n`);
    process.exit(1);
  }

  // Get stories
  console.log('📋 Loading stories...');
  const storyNames = await getStoriesForBlock(blockName);
  console.log(`   Found ${storyNames.length} stories\n`);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const storyName of storyNames) {
    console.log(`📸 ${storyName}...`);

    const fileName = `${blockName}-${storyName}.png`;
    const baselinePath = join(BASELINE_DIR, fileName);
    const actualPath = join(ACTUAL_DIR, fileName);
    const diffPath = join(DIFF_DIR, fileName);

    // Capture actual screenshot
    await captureScreenshot(browser, blockName, storyName, actualPath);

    if (updateBaseline) {
      // Update baseline
      const { copyFileSync } = await import('fs');
      copyFileSync(actualPath, baselinePath);
      console.log(`   ✅ Baseline updated`);
      results.push({ blockName, storyName, passed: true, diffPercentage: 0 });
    } else {
      // Compare with baseline
      if (!existsSync(baselinePath)) {
        console.log(`   ⚠️  No baseline found, creating...`);
        const { copyFileSync } = await import('fs');
        copyFileSync(actualPath, baselinePath);
        results.push({ blockName, storyName, passed: true, diffPercentage: 0 });
      } else {
        const { numDiffPixels, totalPixels, diffPercentage } = await compareScreenshots(
          baselinePath,
          actualPath,
          diffPath
        );

        const passed = diffPercentage < 0.1; // 0.1% threshold
        console.log(`   ${passed ? '✅' : '❌'} ${diffPercentage.toFixed(2)}% different`);

        results.push({ blockName, storyName, passed, diffPercentage, numDiffPixels, totalPixels });
      }
    }
  }

  await browser.close();

  // Generate HTML report
  if (!updateBaseline) {
    console.log('\n📊 Generating HTML report...');
    const { writeFileSync } = await import('fs');
    const reportPath = join(SCREENSHOTS_DIR, 'report.html');
    const html = generateHTMLReport(results);
    writeFileSync(reportPath, html);
    console.log(`   Report: ${reportPath}`);

    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

    if (failed > 0) {
      console.log('❌ Visual regression detected!');
      console.log(`   Open report to review: ${reportPath}\n`);
      process.exit(1);
    } else {
      console.log('✅ All visual tests passed!\n');
    }
  } else {
    console.log('\n✅ Baseline updated for all stories\n');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const blockNameArg = args.find(arg => arg.startsWith('--block='));
const updateBaseline = args.includes('--update-baseline');

if (!blockNameArg) {
  console.error('Usage: node scripts/visual-regression-local.js --block=<block-name> [--update-baseline]');
  console.error('Example: node scripts/visual-regression-local.js --block=carousel');
  console.error('         node scripts/visual-regression-local.js --block=carousel --update-baseline');
  process.exit(1);
}

const blockName = blockNameArg.split('=')[1];

runVisualRegression(blockName, updateBaseline).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
