/**
 * Capture Figma Variant Screenshot
 * 
 * Purpose: Fetch high-resolution screenshot of a Figma component/variant
 * for Vision AI analysis during block generation.
 * 
 * Usage:
 *   npm run capture-figma-variant -- --block=carousel --node-id=9392:121
 * 
 * Output:
 *   blocks/{block}/figma-variant-{nodeId}.png
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getFigmaConfig } from './utils/load-project-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const figmaConfig = getFigmaConfig();
const FIGMA_TOKEN = figmaConfig.accessToken;

function parseArgs() {
  const args = process.argv.slice(2);
  const blockArg = args.find(arg => arg.startsWith('--block='));
  const nodeIdArg = args.find(arg => arg.startsWith('--node-id='));
  const fileIdArg = args.find(arg => arg.startsWith('--file-id='));
  const scaleArg = args.find(arg => arg.startsWith('--scale='));

  if (!blockArg || !nodeIdArg) {
    console.error('Usage: node capture-figma-variant.js --block=<name> --node-id=<id> [--file-id=<id>] [--scale=2]');
    console.error('');
    console.error('Examples:');
    console.error('  npm run capture-figma-variant -- --block=carousel --node-id=9392:121');
    console.error('  npm run capture-figma-variant -- --block=hero --node-id=8668:498 --scale=3');
    process.exit(1);
  }

  return {
    blockName: blockArg.split('=')[1],
    nodeId: nodeIdArg.split('=')[1],
    fileId: fileIdArg ? fileIdArg.split('=')[1] : null,
    scale: scaleArg ? parseInt(scaleArg.split('=')[1], 10) : 2,
  };
}

async function captureFigmaVariant(blockName, nodeId, fileId, scale = 2) {
  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_PERSONAL_ACCESS_TOKEN not set');
  }

  // Load file ID from config if not provided
  let finalFileId = fileId;
  if (!finalFileId) {
    try {
      const configPath = join(__dirname, '..', 'config', 'figma', 'figma-urls.json');
      const config = JSON.parse(await import('fs').then(m => m.readFileSync(configPath, 'utf-8')));
      finalFileId = config.fileId;
    } catch (error) {
      throw new Error('Could not determine Figma file ID. Provide --file-id or ensure config/figma/figma-urls.json exists');
    }
  }

  console.log('\n📸 Figma Variant Screenshot Capture');
  console.log('='.repeat(70));
  console.log(`📦 Block:     ${blockName}`);
  console.log(`🎨 Node ID:   ${nodeId}`);
  console.log(`📁 File ID:   ${finalFileId}`);
  console.log(`📐 Scale:     ${scale}x (${scale === 2 ? 'Retina' : scale === 3 ? 'High-res' : 'Standard'})`);
  console.log('='.repeat(70) + '\n');

  // Request screenshot from Figma
  console.log('📥 Requesting screenshot from Figma API...');
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${finalFileId}?ids=${nodeId}&format=png&scale=${scale}`,
    {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  if (data.err) {
    throw new Error(`Figma API error: ${data.err}`);
  }

  const imageUrl = data.images[nodeId];

  if (!imageUrl) {
    throw new Error(`No image URL returned for node ${nodeId}`);
  }

  console.log('✅ Screenshot URL received');
  console.log(`   URL: ${imageUrl}\n`);

  // Download image
  console.log('⬇️  Downloading screenshot...');
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log(`✅ Downloaded ${(buffer.length / 1024).toFixed(2)} KB\n`);

  // Save to block directory
  const blockDir = join(__dirname, '..', 'blocks', blockName);
  if (!existsSync(blockDir)) {
    mkdirSync(blockDir, { recursive: true });
  }

  const fileName = `figma-variant-${nodeId.replace(':', '-')}.png`;
  const outputPath = join(blockDir, fileName);
  writeFileSync(outputPath, buffer);

  console.log('💾 Screenshot saved:');
  console.log(`   Path: ${outputPath}`);
  console.log(`   File: ${fileName}\n`);

  console.log('='.repeat(70));
  console.log('✅ Capture Complete!');
  console.log('='.repeat(70) + '\n');

  console.log('💡 Next Steps:');
  console.log(`   1. Analyze with Vision AI:`);
  console.log(`      npm run analyze-variant-screenshot -- --block=${blockName} --node-id=${nodeId}`);
  console.log(`   2. Generate CSS with Vision details:`);
  console.log(`      npm run generate-css -- --block=${blockName} --node-id=${nodeId}\n`);

  return {
    blockName,
    nodeId,
    outputPath,
    fileSize: buffer.length,
    scale,
  };
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const { blockName, nodeId, fileId, scale } = parseArgs();

  captureFigmaVariant(blockName, nodeId, fileId, scale)
    .then((result) => {
      console.log('✨ Done!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Is FIGMA_PERSONAL_ACCESS_TOKEN set?');
      console.error('   2. Is the node ID correct? (format: XXXX:YYYY)');
      console.error('   3. Does the block exist in Figma?\n');
      process.exit(1);
    });
}

export default captureFigmaVariant;
