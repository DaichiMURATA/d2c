/**
 * Figma-Storybook Visual Comparison
 * 
 * 機能：
 * 1. Figma & Storybook スクリーンショット取得
 * 2. 画像比較で差異検出（pixelmatch）
 * 3. HTMLレポート生成
 * 4. ブラウザで自動表示
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { getFigmaConfig, getStorybookConfig } from './utils/load-project-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const figmaConfig = getFigmaConfig();
const FIGMA_TOKEN = figmaConfig.accessToken;
const storybookConfig = getStorybookConfig();
const STORYBOOK_URL = storybookConfig.url;
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
  const storyArg = args.find(arg => arg.startsWith('--story='));

  if (!blockArg) {
    console.error('Usage: node compare-figma-storybook.js --block=<name> [--story=<name>] [--node-id=<id>] [--file-id=<id>]');
    console.error('');
    console.error('Examples:');
    console.error('  npm run validate-block -- --block=hero');
    console.error('  npm run validate-block -- --block=cards --story=WithImageNoLink');
    console.error('  npm run validate-block -- --block=hero --node-id=8668:498');
    process.exit(1);
  }

  return {
    blockName: blockArg.split('=')[1],
    storyName: storyArg ? storyArg.split('=')[1] : null,
    nodeId: nodeIdArg ? nodeIdArg.split('=')[1] : null,
    fileId: fileIdArg ? fileIdArg.split('=')[1] : null,
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

/**
 * Get Storybook story name from Figma node ID
 */
function getStoryNameFromNodeId(nodeId) {
  // Mapping from Figma node IDs to Storybook story names
  const nodeIdToStoryMap = {
    // Carousel variants
    '9402:206': 'single-slide-centered-full-content',
    '9392:121': 'multiple-slides-no-content',
    '9392:204': 'multiple-slides-content-center-small',
    '9392:238': 'multiple-slides-content-right-small',
    '9392:271': 'multiple-slides-content-left-small',
    '9392:123': 'multiple-slides-content-center-full',
    // Cards variants
    '531:54': 'with-image-no-link',
    // Hero variants
    '8668:503': 'default', // Component Set (with padding)
    '8668:498': 'default', // Variant: type=default (no padding) ✅ Use this
  };
  
  return nodeIdToStoryMap[nodeId] || 'with-image-no-link'; // Default fallback
}

/**
 * Convert PascalCase story name to kebab-case for Storybook URL
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

async function captureStorybookScreenshot(blockName, storyName, iteration, componentSize = null, screenshotBaseName = null) {
  console.log(`📸 Capturing Storybook screenshot...`);
  console.log(`   Story: ${storyName}`);

  // Use component size from Figma if available, otherwise use defaults
  const width = componentSize ? componentSize.width : 1160;
  const height = componentSize ? componentSize.height : 1200;

  console.log(`   Target size: ${width}x${height} (matching Figma)`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: {
      width: Math.ceil(width),
      height: Math.ceil(height), // Exact match to Figma size (no padding)
    },
    deviceScaleFactor: 2, // Match Figma's scale=2 for Retina displays
  });

  // Convert PascalCase story name to kebab-case for Storybook URL
  const storyId = toKebabCase(storyName);
  const storyUrl = `${STORYBOOK_URL}/iframe.html?id=blocks-${blockName}--${storyId}&viewMode=story`;
  console.log(`   URL: ${storyUrl}`);

  try {
    await page.goto(storyUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Remove default Storybook iframe padding/margins for pixel-perfect comparison
    // This does NOT modify the block's CSS, only the Storybook display container and EDS layout wrappers
    await page.evaluate(() => {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      
      // Remove EDS layout wrapper margins (main > .section > div)
      const wrapper = document.querySelector('main > .section > div');
      if (wrapper) {
        wrapper.style.margin = '0';
        wrapper.style.padding = '0';
        wrapper.style.maxWidth = 'none';
      }
      
      // Remove section margins
      const section = document.querySelector('main > .section');
      if (section) {
        section.style.margin = '0';
      }
    });
    
    await page.waitForTimeout(100); // Wait for styles to apply

    const baseName = screenshotBaseName || blockName;
    const screenshotPath = join(SCREENSHOTS_DIR, `${baseName}-storybook-iter${iteration}.png`);
    
    // Capture the entire viewport for pixel-perfect comparison with Figma
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: Math.ceil(width),
        height: Math.ceil(height),
      }
    });

    await browser.close();
    console.log(`✅ Storybook screenshot saved (${width * 2}x${height * 2} @2x, no padding)`);
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

/**
 * Extract all stories from Storybook Stories file
 */
function getAllStoriesFromFile(blockName) {
  const storiesPath = join(__dirname, '..', 'blocks', blockName, `${blockName}.stories.js`);
  
  if (!existsSync(storiesPath)) {
    return [];
  }

  const content = readFileSync(storiesPath, 'utf-8');
  
  // Extract all export const ... = { ... } blocks
  const storyRegex = /export const (\w+)\s*=\s*\{[\s\S]*?parameters:\s*\{[\s\S]*?design:\s*\{[\s\S]*?url:\s*['"]([^'"]+)['"]/g;
  
  let match;
  const stories = [];
  
  while ((match = storyRegex.exec(content)) !== null) {
    const name = match[1];
    const url = match[2];
    const nodeIdMatch = url.match(/node-id=([0-9]+-[0-9]+)/);
    
    if (nodeIdMatch) {
      stories.push({
        name,
        nodeId: nodeIdMatch[1].replace('-', ':'),
        url,
      });
    }
  }

  return stories;
}

/**
 * Extract Figma node-id from Storybook Stories file
 */
async function getNodeIdFromStories(blockName, storyName = null) {
  const stories = getAllStoriesFromFile(blockName);

  if (stories.length === 0) {
    return null;
  }

  // If story name specified, find that specific story
  if (storyName) {
    const story = stories.find(s => s.name.toLowerCase() === storyName.toLowerCase());
    if (story) {
      return { nodeId: story.nodeId, storyName: story.name, url: story.url };
    }
    console.log(`   ⚠️  Story "${storyName}" not found in ${blockName}.stories.js`);
    console.log(`   Available stories: ${stories.map(s => s.name).join(', ')}`);
    return null;
  }

  // Otherwise, return all stories
  return { stories };
}

/**
 * Get node-id from figma-urls.json config
 */
function getNodeIdFromConfig(blockName) {
  try {
    const configPath = join(__dirname, '..', 'config', 'figma', 'figma-urls.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    
    const blockConfig = config.components?.[blockName];
    if (!blockConfig) {
      return null;
    }

    // Get first variant if available
    if (blockConfig.variants && Object.keys(blockConfig.variants).length > 0) {
      const firstVariant = Object.values(blockConfig.variants)[0];
      return { nodeId: firstVariant, source: 'config' };
    }

    // Otherwise use the main nodeId
    return { nodeId: blockConfig.nodeId, source: 'config' };
  } catch (error) {
    return null;
  }
}

/**
 * Search Figma for component by name
 */
async function searchFigmaForComponent(blockName, fileId) {
  if (!FIGMA_TOKEN) {
    return null;
  }

  console.log(`   🔍 Searching Figma for "${blockName}" component...`);

  try {
    const response = await fetch(`${FIGMA_API_BASE}/files/${fileId}`, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Search for component with matching name
    function findComponent(node, searchName) {
      if (!node) return null;
      
      const normalizedName = node.name?.toLowerCase().replace(/\s+/g, '');
      const normalizedSearch = searchName.toLowerCase().replace(/\s+/g, '');
      
      if ((node.type === 'COMPONENT_SET' || node.type === 'COMPONENT') && 
          normalizedName === normalizedSearch) {
        return node;
      }

      if (node.children) {
        for (const child of node.children) {
          const found = findComponent(child, searchName);
          if (found) return found;
        }
      }

      return null;
    }

    const component = findComponent(data.document, blockName);
    
    if (component) {
      // If it's a Component Set, get the first variant
      if (component.type === 'COMPONENT_SET' && component.children?.length > 0) {
        console.log(`   ✅ Found Component Set with ${component.children.length} variants`);
        return { nodeId: component.children[0].id, source: 'figma-search' };
      }
      
      console.log(`   ✅ Found Component`);
      return { nodeId: component.id, source: 'figma-search' };
    }

    return null;
  } catch (error) {
    console.log(`   ⚠️  Figma search failed: ${error.message}`);
    return null;
  }
}

async function checkStorybookRunning() {
  try {
    const response = await fetch(STORYBOOK_URL);
    return response.ok;
  } catch {
    return false;
  }
}

async function generateHTMLReport(blockName, fileId, nodeId, result, storyName = null) {
  const reportFileName = storyName 
    ? `${blockName}-${storyName}-report.html`
    : `${blockName}-report.html`;
  const reportPath = join(SCREENSHOTS_DIR, reportFileName);
  
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

async function compareVisuals(blockName, fileId, nodeId, storyName = null) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📸 Figma-Storybook Visual Comparison`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(`📦 Block: ${blockName}`);
  if (storyName) {
    console.log(`📖 Story: ${storyName}`);
  }
  console.log(`🎨 Figma Node: ${nodeId}`);
  console.log(`📁 Figma File: ${fileId}`);
  console.log(`🎯 Match Threshold: ${MATCH_THRESHOLD}%\n`);

  const isRunning = await checkStorybookRunning();
  if (!isRunning) {
    console.error(`❌ Storybook is not running at ${STORYBOOK_URL}`);
    console.log(`\n💡 Start Storybook first: npm run storybook\n`);
    process.exit(1);
  }

  let componentSize = null;

  // Get component size from Figma
  console.log('📐 Fetching component size from Figma...');
  componentSize = await getComponentSize(fileId, nodeId);
  if (componentSize) {
    console.log(`   Component size: ${componentSize.width} x ${componentSize.height}\n`);
  } else {
    console.log(`   ⚠️  Could not fetch component size, using defaults\n`);
  }

  const iteration = 1;
  
  try {
    // Determine story name for screenshots
    const screenshotBaseName = storyName 
      ? `${blockName}-${storyName}`
      : blockName;
    
    // 1. Fetch Figma screenshot
    const figmaPath = await fetchFigmaScreenshot(fileId, nodeId, screenshotBaseName, iteration);

    // 2. Capture Storybook screenshot
    const resolvedStoryName = storyName || getStoryNameFromNodeId(nodeId);
    const storybookPath = await captureStorybookScreenshot(blockName, resolvedStoryName, iteration, componentSize, screenshotBaseName);

    // 3. Compare screenshots
    const comparison = await compareScreenshotsPixelMatch(
      figmaPath,
      storybookPath,
      screenshotBaseName,
      iteration
    );

    const lastDiffPercentage = comparison.diffPercentage;
    const isMatch = comparison.isMatch;

    if (isMatch) {
      console.log(`\n✅ Visual match achieved! 🎉`);
    } else {
      console.log(`\n📊 Difference: ${lastDiffPercentage.toFixed(2)}%`);
      console.log(`   (Threshold: ${MATCH_THRESHOLD}%)`);
    }

    console.log(`\n${'='.repeat(70)}`);
    if (isMatch) {
      console.log(`✅ Validation Complete! ${blockName} matches Figma design.`);
      console.log(`   Difference: ${lastDiffPercentage.toFixed(2)}%`);
    } else {
      console.log(`📊 Visual Comparison Complete`);
      console.log(`   Difference: ${lastDiffPercentage.toFixed(2)}%`);
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
        figmaPath: join(SCREENSHOTS_DIR, `${screenshotBaseName}-figma-iter1.png`),
        storybookPath: join(SCREENSHOTS_DIR, `${screenshotBaseName}-storybook-iter${iteration}.png`),
        diffPath: join(SCREENSHOTS_DIR, `${screenshotBaseName}-diff-iter${iteration}.png`),
        diffPercentage: lastDiffPercentage,
        passed: isMatch,
        iterations: iteration,
      },
      storyName
    );
    console.log(`   Report: ${reportPath}\n`);

    // Open HTML report in browser
    const { exec } = await import('child_process');
    console.log(`🌐 Opening report in browser...`);
    exec(`open "${reportPath}"`, (error) => {
      if (error) {
        console.log(`   ⚠️  Could not auto-open: ${error.message}`);
        console.log(`   💡 Manually open: open ${reportPath}\n`);
      } else {
        console.log(`   ✅ Report opened in browser\n`);
      }
    });
    
    // Return result for summary
    return {
      storyName: storyName || 'default',
      nodeId,
      passed: isMatch,
      diffPercentage: lastDiffPercentage,
      reportPath,
    };
    
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    
    console.log(`\n💡 Troubleshooting:`);
    console.log(`   1. Is Storybook running? npm run storybook`);
    console.log(`   2. Is FIGMA_PERSONAL_ACCESS_TOKEN set?`);
    console.log(`   3. Does the Story exist in Storybook?`);
    
    throw error;
  }
}

// Main execution
const { blockName, storyName, nodeId, fileId } = parseArgs();

(async () => {
  // Determine Figma file ID
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

  // Determine node-id and stories to validate
  let storiesToValidate = [];
  
  if (nodeId) {
    // If node-id is provided manually, validate just that one
    storiesToValidate = [{ nodeId, storyName: storyName || 'default' }];
  } else {
    console.log(`🔍 Resolving Figma node-id for block: ${blockName}${storyName ? ` (story: ${storyName})` : ''}\n`);
    
    // Step 1: Try to get from Storybook Stories file
    console.log(`   📖 Checking Storybook Stories file...`);
    const storiesResult = await getNodeIdFromStories(blockName, storyName);
    
    if (storiesResult) {
      if (storiesResult.stories) {
        // Multiple stories found (no specific story requested)
        storiesToValidate = storiesResult.stories;
        console.log(`   ✅ Found ${storiesToValidate.length} stories in ${blockName}.stories.js`);
        storiesToValidate.forEach(story => {
          console.log(`      - ${story.name} (${story.nodeId})`);
        });
        console.log('');
      } else {
        // Single story found (specific story requested)
        storiesToValidate = [{
          name: storiesResult.storyName,
          nodeId: storiesResult.nodeId,
          url: storiesResult.url,
        }];
        console.log(`   ✅ Found in ${blockName}.stories.js`);
        console.log(`      Story: ${storiesResult.storyName}`);
        console.log(`      Node ID: ${storiesResult.nodeId}`);
        console.log(`      URL: ${storiesResult.url}\n`);
      }
    } else {
      // Step 2: Try to get from config file
      console.log(`   ⚠️  Not found in Stories file\n`);
      console.log(`   📄 Checking figma-urls.json...`);
      const configResult = getNodeIdFromConfig(blockName);
      if (configResult) {
        storiesToValidate = [{ nodeId: configResult.nodeId, name: 'default' }];
        console.log(`   ✅ Found in config (${configResult.source})`);
        console.log(`      Node ID: ${configResult.nodeId}\n`);
      } else {
        // Step 3: Search Figma API
        console.log(`   ⚠️  Not found in config\n`);
        const figmaResult = await searchFigmaForComponent(blockName, finalFileId);
        if (figmaResult) {
          storiesToValidate = [{ nodeId: figmaResult.nodeId, name: 'default' }];
          console.log(`      Node ID: ${figmaResult.nodeId}\n`);
        } else {
          console.error(`\n❌ Could not find Figma node-id for block: ${blockName}`);
          console.error(`\n💡 Solutions:`);
          console.error(`   1. Add Figma URL to ${blockName}.stories.js:`);
          console.error(`      parameters: { design: { type: 'figma', url: 'https://...' } }`);
          console.error(`   2. Run: npm run discover-components -- --filter=${blockName}`);
          console.error(`   3. Specify manually: --node-id=XXXX:YYYY\n`);
          process.exit(1);
        }
      }
    }
  }

  // Validate all stories
  const results = [];
  
  for (let i = 0; i < storiesToValidate.length; i++) {
    const story = storiesToValidate[i];
    
    if (storiesToValidate.length > 1) {
      console.log(`\n${'━'.repeat(70)}`);
      console.log(`📖 Validating Story ${i + 1} of ${storiesToValidate.length}: ${story.name}`);
      console.log(`${'━'.repeat(70)}`);
    }
    
    try {
      const result = await compareVisuals(blockName, finalFileId, story.nodeId, story.name);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to validate story "${story.name}":`, error.message);
      results.push({
        storyName: story.name,
        nodeId: story.nodeId,
        passed: false,
        diffPercentage: null,
        error: error.message,
      });
    }
    
    // Small delay between stories
    if (i < storiesToValidate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Display summary if multiple stories were validated
  if (results.length > 1) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 VALIDATION SUMMARY: ${blockName}`);
    console.log(`${'='.repeat(70)}\n`);
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total:  ${results.length}\n`);
    
    console.log(`Detailed Results:\n`);
    results.forEach((result, idx) => {
      const status = result.passed ? '✅' : '❌';
      const diff = result.diffPercentage !== null ? `${result.diffPercentage.toFixed(2)}%` : 'ERROR';
      console.log(`  ${idx + 1}. ${status} ${result.storyName.padEnd(30)} - Diff: ${diff}`);
      if (result.reportPath) {
        console.log(`     Report: ${result.reportPath}`);
      }
    });
    
    console.log(`\n${'='.repeat(70)}\n`);
    
    // Open the last report
    if (results.length > 0 && results[results.length - 1].reportPath) {
      const { exec } = await import('child_process');
      const lastReport = results[results.length - 1].reportPath;
      console.log(`🌐 Opening last report (${results[results.length - 1].storyName}) in browser...`);
      exec(`open "${lastReport}"`);
    }
  }
})().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
