/**
 * Figma-Storybook Automated Visual Validation Loop
 * 
 * 完全自動化：
 * 1. Figma & Storybook スクリーンショット取得
 * 2. 画像比較で差異検出
 * 3. 差異に基づいてCSS/JS自動修正
 * 4. 再度スクリーンショット取得
 * 5. 一致するまで繰り返し（最大5回）
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_TOKEN = process.env.FIGMA_PERSONAL_ACCESS_TOKEN || process.env.FIGMA_ACCESS_TOKEN;
const STORYBOOK_URL = 'http://localhost:6006';
const MAX_ITERATIONS = 5;
const HOT_RELOAD_WAIT = 3000;
const SCREENSHOTS_DIR = join(__dirname, '..', '.validation-screenshots');
const MATCH_THRESHOLD = 0.1; // 差異が0.1%以下なら一致とみなす

if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const blockArg = args.find(arg => arg.startsWith('--block='));
  const nodeIdArg = args.find(arg => arg.startsWith('--node-id='));
  const fileIdArg = args.find(arg => arg.startsWith('--file-id='));
  const demoMode = args.includes('--demo');

  if (!blockArg || !nodeIdArg) {
    console.error('Usage: node compare-figma-storybook.js --block=<name> --node-id=<id> [--file-id=<id>] [--demo]');
    process.exit(1);
  }

  return {
    blockName: blockArg.split('=')[1],
    nodeId: nodeIdArg.split('=')[1],
    fileId: fileIdArg ? fileIdArg.split('=')[1] : null,
    demoMode,
  };
}

async function fetchFigmaScreenshot(fileId, nodeId, blockName, iteration) {
  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_PERSONAL_ACCESS_TOKEN not set');
  }

  console.log(`📥 Fetching Figma screenshot...`);

  const response = await fetch(
    `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&format=png&scale=2`,
    {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.err) {
    throw new Error(`Figma API error: ${data.err}`);
  }

  const imageUrl = data.images[nodeId];
  if (!imageUrl) {
    throw new Error(`No image URL for node ${nodeId}`);
  }

  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const screenshotPath = join(SCREENSHOTS_DIR, `${blockName}-figma-iter${iteration}.png`);
  writeFileSync(screenshotPath, buffer);

  console.log(`✅ Figma screenshot saved`);
  return screenshotPath;
}

async function getComponentSize(fileId, nodeId) {
  const url = `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${nodeId}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const nodeData = data.nodes[nodeId];

  if (nodeData && nodeData.document.absoluteBoundingBox) {
    return {
      width: nodeData.document.absoluteBoundingBox.width,
      height: nodeData.document.absoluteBoundingBox.height,
    };
  }

  return null;
}

async function captureStorybookScreenshot(blockName, storyName, iteration, componentSize = null) {
  console.log(`📸 Capturing Storybook screenshot...`);

  // Use component size from Figma if available, otherwise use defaults
  const width = componentSize ? componentSize.width : 1160;
  const height = componentSize ? componentSize.height : 1200;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: {
      width: Math.ceil(width),
      height: Math.ceil(height + 100), // Add some padding for potential overflow
    },
    deviceScaleFactor: 2, // Match Figma's scale=2 for Retina displays
  });

  const storyUrl = `${STORYBOOK_URL}/iframe.html?id=blocks-${blockName}--${storyName}&viewMode=story`;

  try {
    await page.goto(storyUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const screenshotPath = join(SCREENSHOTS_DIR, `${blockName}-storybook-iter${iteration}.png`);
    
    const selector = `.${blockName}.block, .${blockName}, [data-block-name="${blockName}"]`;
    const element = await page.locator(selector).first();
    
    if (await element.count() > 0) {
      await element.screenshot({ path: screenshotPath });
    } else {
      await page.screenshot({ path: screenshotPath, fullPage: false });
    }

    await browser.close();
    console.log(`✅ Storybook screenshot saved`);
    return screenshotPath;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function compareScreenshotsPixelMatch(figmaPath, storybookPath, blockName, iteration) {
  console.log(`\n🔍 Comparing screenshots (pixel-by-pixel)...`);

  const figmaImg = PNG.sync.read(readFileSync(figmaPath));
  const storybookImg = PNG.sync.read(readFileSync(storybookPath));

  console.log(`   Figma size:     ${figmaImg.width}x${figmaImg.height}`);
  console.log(`   Storybook size: ${storybookImg.width}x${storybookImg.height}`);

  // Use the smaller dimensions for comparison
  const width = Math.min(figmaImg.width, storybookImg.width);
  const height = Math.min(figmaImg.height, storybookImg.height);

  if (figmaImg.width !== storybookImg.width || figmaImg.height !== storybookImg.height) {
    console.log(`   📐 Comparing overlapping area: ${width}x${height}`);
  }

  const diff = new PNG({ width, height });

  // Create cropped versions for comparison
  const figmaCropped = new PNG({ width, height });
  const storybookCropped = new PNG({ width, height });

  // Copy pixels from original images to cropped versions
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const figmaIdx = (figmaImg.width * y + x) << 2;
      const cropIdx = (width * y + x) << 2;
      
      figmaCropped.data[cropIdx] = figmaImg.data[figmaIdx];
      figmaCropped.data[cropIdx + 1] = figmaImg.data[figmaIdx + 1];
      figmaCropped.data[cropIdx + 2] = figmaImg.data[figmaIdx + 2];
      figmaCropped.data[cropIdx + 3] = figmaImg.data[figmaIdx + 3];
      
      const storybookIdx = (storybookImg.width * y + x) << 2;
      storybookCropped.data[cropIdx] = storybookImg.data[storybookIdx];
      storybookCropped.data[cropIdx + 1] = storybookImg.data[storybookIdx + 1];
      storybookCropped.data[cropIdx + 2] = storybookImg.data[storybookIdx + 2];
      storybookCropped.data[cropIdx + 3] = storybookImg.data[storybookIdx + 3];
    }
  }

  const numDiffPixels = pixelmatch(
    figmaCropped.data,
    storybookCropped.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;

  // Save diff image
  const diffPath = join(SCREENSHOTS_DIR, `${blockName}-diff-iter${iteration}.png`);
  writeFileSync(diffPath, PNG.sync.write(diff));

  console.log(`\n📊 Comparison Results:`);
  console.log(`   Different pixels: ${numDiffPixels.toLocaleString()} / ${totalPixels.toLocaleString()}`);
  console.log(`   Difference: ${diffPercentage.toFixed(2)}%`);
  console.log(`   Diff image: ${diffPath}`);

  const isMatch = diffPercentage < MATCH_THRESHOLD;

  if (isMatch) {
    console.log(`   ✅ Images match! (< ${MATCH_THRESHOLD}% difference)`);
  } else {
    console.log(`   ❌ Images differ significantly`);
  }

  return {
    isMatch,
    diffPercentage,
    numDiffPixels,
    totalPixels,
    diffPath,
  };
}

async function analyzeDifferencesAndFix(blockName, diffPercentage, iteration) {
  console.log(`\n🔧 Analyzing differences and applying fixes...`);

  // Heuristic-based fixes
  const fixes = [];

  if (diffPercentage > 50) {
    console.log(`   ⚠️  Large difference detected (${diffPercentage.toFixed(2)}%)`);
    console.log(`   Applying major layout fixes...`);
    fixes.push({
      property: 'width',
      value: '100%',
      reason: 'Major layout difference',
    });
    fixes.push({
      property: 'max-width',
      value: '1200px',
      reason: 'Constrain width',
    });
  } else if (diffPercentage > 20) {
    console.log(`   ⚠️  Moderate difference detected (${diffPercentage.toFixed(2)}%)`);
    console.log(`   Applying spacing/color fixes...`);
    fixes.push({
      property: 'margin',
      value: '0 auto',
      reason: 'Center alignment',
    });
  } else if (diffPercentage > 5) {
    console.log(`   ⚠️  Minor difference detected (${diffPercentage.toFixed(2)}%)`);
    console.log(`   Applying fine-tuning fixes...`);
    fixes.push({
      property: 'box-sizing',
      value: 'border-box',
      reason: 'Box model adjustment',
    });
  }

  if (fixes.length === 0) {
    console.log(`   ℹ️  No automatic fixes available for ${diffPercentage.toFixed(2)}% difference`);
    console.log(`   Manual review recommended`);
    return false;
  }

  // Apply fixes to CSS
  const cssPath = join(__dirname, '..', 'blocks', blockName, `${blockName}.css`);
  let cssContent = readFileSync(cssPath, 'utf-8');

  fixes.forEach(fix => {
    console.log(`   - ${fix.property}: ${fix.value} (${fix.reason})`);
    
    const selectorRegex = new RegExp(`\\.${blockName}\\s*\\{[^}]*\\}`, 's');
    const match = cssContent.match(selectorRegex);

    if (match) {
      const selectorBlock = match[0];
      const propertyRegex = new RegExp(`${fix.property}:\\s*[^;]+;`, 'g');

      if (propertyRegex.test(selectorBlock)) {
        const newSelectorBlock = selectorBlock.replace(
          propertyRegex,
          `${fix.property}: ${fix.value};`
        );
        cssContent = cssContent.replace(selectorBlock, newSelectorBlock);
      } else {
        const newSelectorBlock = selectorBlock.replace(
          /\{/,
          `{\n  ${fix.property}: ${fix.value};`
        );
        cssContent = cssContent.replace(selectorBlock, newSelectorBlock);
      }
    }
  });

  writeFileSync(cssPath, cssContent);
  console.log(`✅ Applied ${fixes.length} fixes to ${cssPath}`);

  return true;
}

async function checkStorybookRunning() {
  try {
    const response = await fetch(STORYBOOK_URL);
    return response.ok;
  } catch {
    return false;
  }
}

async function generateHTMLReport(blockName, fileId, nodeId, result) {
  const reportPath = join(SCREENSHOTS_DIR, `${blockName}-report.html`);
  
  const figmaUrl = `https://www.figma.com/design/${fileId}?node-id=${nodeId.replace(':', '-')}`;
  const storybookUrl = `${STORYBOOK_URL}/?path=/story/blocks-${blockName}--default`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Figma-Storybook Validation Report: ${blockName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      background: #f5f5f5; 
      padding: 20px; 
      color: #333;
    }
    .header { 
      background: white; 
      padding: 30px; 
      border-radius: 8px; 
      margin-bottom: 20px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
    }
    h1 { 
      font-size: 28px; 
      margin-bottom: 10px; 
    }
    .status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 10px;
    }
    .status.pass {
      background: #d1fae5;
      color: #065f46;
    }
    .status.fail {
      background: #fee2e2;
      color: #991b1b;
    }
    .summary { 
      display: flex; 
      gap: 20px; 
      margin-top: 20px; 
      flex-wrap: wrap;
    }
    .stat { 
      background: #f8f8f8; 
      padding: 15px 20px; 
      border-radius: 6px; 
      flex: 1;
      min-width: 150px;
    }
    .stat-value { 
      font-size: 32px; 
      font-weight: bold; 
    }
    .stat-label { 
      font-size: 14px; 
      color: #666; 
      margin-top: 5px; 
    }
    .links {
      margin-top: 20px;
      display: flex;
      gap: 15px;
    }
    .link-btn {
      display: inline-block;
      padding: 10px 20px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .link-btn:hover {
      background: #2563eb;
    }
    .link-btn.secondary {
      background: #6b7280;
    }
    .link-btn.secondary:hover {
      background: #4b5563;
    }
    .comparison {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .comparison h2 {
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
    }
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .image-card {
      background: #f9fafb;
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid #e5e7eb;
    }
    .image-card h3 {
      background: #374151;
      color: white;
      padding: 12px 15px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .image-card.figma h3 {
      background: #a78bfa;
    }
    .image-card.storybook h3 {
      background: #ff4785;
    }
    .image-card.diff h3 {
      background: #ef4444;
    }
    .image-card img {
      width: 100%;
      display: block;
      background: white;
    }
    .diff-full {
      grid-column: 1 / -1;
    }
    .suggestions {
      background: #fef3c7;
      border: 2px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .suggestions h3 {
      color: #92400e;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .suggestions ul {
      list-style: none;
      padding-left: 0;
    }
    .suggestions li {
      padding: 10px 0;
      border-bottom: 1px solid #fbbf24;
      color: #78350f;
    }
    .suggestions li:last-child {
      border-bottom: none;
    }
    .suggestions code {
      background: #fde68a;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 Figma-Storybook Validation Report</h1>
    <div>Block: <strong>${blockName}</strong></div>
    <div class="status ${result.passed ? 'pass' : 'fail'}">
      ${result.passed ? '✅ PASSED' : '❌ FAILED'}
    </div>
    
    <div class="summary">
      <div class="stat">
        <div class="stat-value" style="color: ${result.passed ? '#22c55e' : '#ef4444'}">
          ${result.diffPercentage.toFixed(2)}%
        </div>
        <div class="stat-label">Difference</div>
      </div>
      <div class="stat">
        <div class="stat-value">${result.iterations}</div>
        <div class="stat-label">Iterations</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: ${result.passed ? '#22c55e' : '#6b7280'}">
          ${result.passed ? '< 0.1%' : '≥ 0.1%'}
        </div>
        <div class="stat-label">Threshold</div>
      </div>
    </div>

    <div class="links">
      <a href="${figmaUrl}" target="_blank" class="link-btn">
        🎨 Open in Figma
      </a>
      <a href="${storybookUrl}" target="_blank" class="link-btn secondary">
        📖 Open in Storybook
      </a>
    </div>
  </div>

  <div class="comparison">
    <h2>Visual Comparison</h2>
    
    <div class="image-grid">
      <div class="image-card figma">
        <h3>Figma Design (Target)</h3>
        <img src="${result.figmaPath.split('/').pop()}" alt="Figma Design">
      </div>
      
      <div class="image-card storybook">
        <h3>Storybook Implementation (Actual)</h3>
        <img src="${result.storybookPath.split('/').pop()}" alt="Storybook Implementation">
      </div>
    </div>

    ${!result.passed ? `
      <div class="image-grid">
        <div class="image-card diff diff-full">
          <h3>Pixel Difference (Pink = Different)</h3>
          <img src="${result.diffPath.split('/').pop()}" alt="Difference">
        </div>
      </div>
    ` : ''}
  </div>

  ${!result.passed ? `
    <div class="suggestions">
      <h3>💡 Suggested Next Steps</h3>
      <ul>
        <li>
          <strong>Visual Review:</strong> Compare the Figma design (purple) with Storybook (pink) above.
          The diff image shows exact pixel differences in pink/red.
        </li>
        <li>
          <strong>Common Issues:</strong>
          <code>spacing</code>, <code>colors</code>, <code>font-size</code>, 
          <code>border-radius</code>, <code>padding/margin</code>
        </li>
        <li>
          <strong>Use Figma Inspect:</strong> Click "Open in Figma" to get exact CSS values.
        </li>
        <li>
          <strong>Re-run after fixes:</strong> 
          <code>npm run validate-block -- --block=${blockName} --node-id=${nodeId}</code>
        </li>
        <li>
          <strong>Vision LLM Analysis (Optional):</strong>
          <code>npm run analyze-diff -- --block=${blockName} --iteration=${result.iterations}</code>
        </li>
      </ul>
    </div>
  ` : `
    <div class="suggestions" style="background: #d1fae5; border-color: #10b981;">
      <h3 style="color: #065f46;">✅ Perfect Match!</h3>
      <ul>
        <li style="color: #065f46; border-bottom-color: #10b981;">
          Your Storybook implementation matches the Figma design within the acceptable threshold (< 0.1% difference).
        </li>
        <li style="color: #065f46; border-bottom-color: #10b981;">
          No further action required. You can proceed with confidence! 🎉
        </li>
      </ul>
    </div>
  `}

  <div class="footer">
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Automated Figma-Storybook Visual Validation</p>
  </div>
</body>
</html>
  `;

  writeFileSync(reportPath, html);
  return reportPath;
}

async function automatedValidationLoop(blockName, fileId, nodeId, demoMode = false) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔄 Automated Figma-Storybook Visual Validation Loop`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(`📦 Block: ${blockName}`);
  console.log(`🎨 Figma Node: ${nodeId}`);
  console.log(`📁 Figma File: ${fileId}`);
  console.log(`🎭 Demo Mode: ${demoMode ? 'ON' : 'OFF'}`);
  console.log(`🎯 Match Threshold: ${MATCH_THRESHOLD}%\n`);

  const isRunning = await checkStorybookRunning();
  if (!isRunning) {
    console.error(`❌ Storybook is not running at ${STORYBOOK_URL}`);
    console.log(`\n💡 Start Storybook first: npm run storybook\n`);
    process.exit(1);
  }

  let iteration = 0;
  let isMatch = false;
  let lastDiffPercentage = 100;
  let componentSize = null;

  // Get component size from Figma (once at the start)
  console.log('📐 Fetching component size from Figma...');
  componentSize = await getComponentSize(fileId, nodeId);
  if (componentSize) {
    console.log(`   Component size: ${componentSize.width} x ${componentSize.height}\n`);
  } else {
    console.log(`   ⚠️  Could not fetch component size, using defaults\n`);
  }

  while (!isMatch && iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📍 Iteration ${iteration}/${MAX_ITERATIONS}`);
    console.log(`${'─'.repeat(70)}\n`);

    try {
      // 1. Fetch Figma screenshot (only once at start)
      let figmaPath;
      if (iteration === 1) {
        figmaPath = await fetchFigmaScreenshot(fileId, nodeId, blockName, iteration);
      } else {
        // Reuse Figma screenshot from iteration 1
        figmaPath = join(SCREENSHOTS_DIR, `${blockName}-figma-iter1.png`);
        console.log(`📥 Using cached Figma screenshot`);
      }

      // 2. Capture Storybook screenshot
      const storybookPath = await captureStorybookScreenshot(blockName, 'default', iteration, componentSize);

      // 3. Compare screenshots
      const comparison = await compareScreenshotsPixelMatch(
        figmaPath,
        storybookPath,
        blockName,
        iteration
      );

      lastDiffPercentage = comparison.diffPercentage;

      if (comparison.isMatch) {
        console.log(`\n✅ Visual match achieved! 🎉`);
        isMatch = true;
      } else {
        if (iteration >= MAX_ITERATIONS) {
          console.log(`\n⚠️  Max iterations (${MAX_ITERATIONS}) reached`);
          break;
        }

        // 4. Analyze and apply fixes
        const fixesApplied = await analyzeDifferencesAndFix(
          blockName,
          comparison.diffPercentage,
          iteration
        );

        if (!fixesApplied) {
          console.log(`\n⚠️  Unable to apply automatic fixes`);
          console.log(`   Manual intervention required`);
          break;
        }

        // 5. Wait for hot reload
        console.log(`\n⏳ Waiting ${HOT_RELOAD_WAIT}ms for hot reload...`);
        await new Promise(resolve => setTimeout(resolve, HOT_RELOAD_WAIT));
      }
    } catch (error) {
      console.error(`\n❌ Error in iteration ${iteration}:`, error.message);
      
      if (iteration === 1) {
        console.log(`\n💡 Troubleshooting:`);
        console.log(`   1. Is Storybook running? npm run storybook`);
        console.log(`   2. Is FIGMA_PERSONAL_ACCESS_TOKEN set?`);
        console.log(`   3. Does the Story exist in Storybook?`);
      }
      
      process.exit(1);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  if (isMatch) {
    console.log(`✅ Validation Complete! ${blockName} matches Figma design.`);
    console.log(`   Final difference: ${lastDiffPercentage.toFixed(2)}%`);
  } else {
    console.log(`⚠️  Validation incomplete after ${MAX_ITERATIONS} iterations`);
    console.log(`   Final difference: ${lastDiffPercentage.toFixed(2)}%`);
    console.log(`   Manual review recommended`);
  }
  console.log(`${'='.repeat(70)}\n`);
  console.log(`📁 All screenshots saved to: ${SCREENSHOTS_DIR}\n`);
  
  // Generate HTML report
  console.log(`📊 Generating HTML report...`);
  const reportPath = await generateHTMLReport(
    blockName,
    fileId,
    nodeId,
    {
      figmaPath: join(SCREENSHOTS_DIR, `${blockName}-figma-iter1.png`),
      storybookPath: join(SCREENSHOTS_DIR, `${blockName}-storybook-iter${iteration}.png`),
      diffPath: join(SCREENSHOTS_DIR, `${blockName}-diff-iter${iteration}.png`),
      diffPercentage: lastDiffPercentage,
      passed: isMatch,
      iterations: iteration,
    }
  );
  console.log(`   Report: ${reportPath}`);
  console.log(`\n💡 Open report: open ${reportPath}\n`);
}

// Main execution
const { blockName, nodeId, fileId, demoMode } = parseArgs();

let finalFileId = fileId;
if (!finalFileId) {
  try {
    const figmaUrlsPath = join(__dirname, '..', 'config', 'figma', 'figma-urls.json');
    const figmaUrls = JSON.parse(readFileSync(figmaUrlsPath, 'utf-8'));
    finalFileId = figmaUrls.fileId;
  } catch (error) {
    console.error('❌ Could not determine Figma file ID');
    process.exit(1);
  }
}

automatedValidationLoop(blockName, finalFileId, nodeId, demoMode).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
