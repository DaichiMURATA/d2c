#!/usr/bin/env node

/**
 * Bulk Figma Variant Assets Downloader
 * 
 * Downloads images for all variants of a Figma Component Set
 * Updates Storybook stories to use the downloaded images
 * 
 * Usage:
 *   node scripts/download-all-variant-assets.js --block=carousel
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = join(__dirname, '..', 'config', 'figma', 'figma-urls.json');

async function downloadAllVariantAssets(blockName) {
  console.log('🎨 Bulk Figma Variant Assets Downloader\n');
  console.log(`   Block: ${blockName}\n`);

  // 1. Load config
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const component = config.components[blockName];

  if (!component) {
    throw new Error(`Component "${blockName}" not found in config`);
  }

  if (!component.variants || typeof component.variants !== 'object') {
    throw new Error(`No variants defined for "${blockName}"`);
  }

  const variants = Object.entries(component.variants);
  console.log(`📋 Found ${variants.length} variant(s)\n`);

  // 2. Download assets for each variant
  const downloadedVariants = [];

  for (const [variantName, nodeId] of variants) {
    console.log(`──────────────────────────────────────────────────────────────────────`);
    console.log(`📦 Variant: ${variantName}`);
    console.log(`🎨 Node ID: ${nodeId}\n`);

    try {
      // Execute download-figma-assets.js for this variant
      const command = `npm run download-assets -- --node-id=${nodeId} --block=${blockName}`;
      execSync(command, { 
        stdio: 'inherit',
        cwd: join(__dirname, '..'),
      });

      downloadedVariants.push({
        variantName,
        nodeId,
        status: 'success',
      });

      console.log(`✅ ${variantName} completed\n`);
    } catch (error) {
      console.error(`❌ ${variantName} failed: ${error.message}\n`);
      downloadedVariants.push({
        variantName,
        nodeId,
        status: 'failed',
        error: error.message,
      });
    }
  }

  // 3. Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ Download Complete`);
  console.log(`${'='.repeat(70)}\n`);

  const successCount = downloadedVariants.filter(v => v.status === 'success').length;
  const failCount = downloadedVariants.filter(v => v.status === 'failed').length;

  console.log(`   Success: ${successCount} / ${variants.length}`);
  if (failCount > 0) {
    console.log(`   Failed:  ${failCount}`);
  }

  console.log('\n📊 Results:\n');
  downloadedVariants.forEach(variant => {
    const icon = variant.status === 'success' ? '✅' : '❌';
    console.log(`   ${icon} ${variant.variantName} (${variant.nodeId})`);
    if (variant.error) {
      console.log(`      Error: ${variant.error}`);
    }
  });

  console.log('\n💡 Next steps:');
  console.log(`   1. Check downloaded assets in: blocks/${blockName}/assets/`);
  console.log(`   2. Update Storybook stories to use the downloaded images`);
  console.log(`   3. Run: npm run validate-block -- --block=${blockName} --node-id=<variant-node-id>\n`);

  return downloadedVariants;
}

// Parse command line arguments
const args = process.argv.slice(2);
const blockNameArg = args.find(arg => arg.startsWith('--block='));

if (!blockNameArg) {
  console.error('Usage: node scripts/download-all-variant-assets.js --block=<block-name>');
  console.error('Example: node scripts/download-all-variant-assets.js --block=carousel');
  process.exit(1);
}

const blockName = blockNameArg.split('=')[1];

downloadAllVariantAssets(blockName).catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
