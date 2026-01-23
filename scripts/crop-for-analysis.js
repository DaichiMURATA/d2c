#!/usr/bin/env node

/**
 * Crop specific area from screenshots for detailed Vision AI analysis
 * 
 * Usage:
 *   node scripts/crop-for-analysis.js --block=hero --area=heading
 */

import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = join(__dirname, '..', '.validation-screenshots');
const CROPS_DIR = join(SCREENSHOTS_DIR, 'crops');

// Define crop areas for different blocks (coordinates at @2x scale)
const CROP_AREAS = {
  hero: {
    heading: {
      description: 'Hero heading area',
      x: 0,
      y: 0,
      width: 1200,
      height: 300,
    },
    background: {
      description: 'Background image area',
      x: 600,
      y: 0,
      width: 1720,
      height: 728,
    },
    full: {
      description: 'Full component',
      x: 0,
      y: 0,
      width: 2320,
      height: 728,
    },
  },
  // Add more blocks as needed
};

async function cropScreenshots(blockName, areaName, iteration = 1) {
  console.log(`\n🖼️  Cropping ${blockName} screenshots for Vision AI analysis\n`);

  const cropArea = CROP_AREAS[blockName]?.[areaName];
  if (!cropArea) {
    console.error(`❌ Crop area "${areaName}" not defined for block "${blockName}"`);
    process.exit(1);
  }

  console.log(`   Area: ${cropArea.description}`);
  console.log(`   Crop: x=${cropArea.x}, y=${cropArea.y}, w=${cropArea.width}, h=${cropArea.height}\n`);

  // Create crops directory
  if (!existsSync(CROPS_DIR)) {
    mkdirSync(CROPS_DIR, { recursive: true });
  }

  // Crop Figma screenshot
  const figmaInput = join(SCREENSHOTS_DIR, `${blockName}-figma-iter${iteration}.png`);
  const figmaOutput = join(CROPS_DIR, `${blockName}-figma-${areaName}.png`);

  if (!existsSync(figmaInput)) {
    console.error(`❌ Figma screenshot not found: ${figmaInput}`);
    process.exit(1);
  }

  await sharp(figmaInput)
    .extract({
      left: cropArea.x,
      top: cropArea.y,
      width: cropArea.width,
      height: cropArea.height,
    })
    .toFile(figmaOutput);

  console.log(`✅ Cropped Figma: ${figmaOutput}`);

  // Crop Storybook screenshot
  const storybookInput = join(SCREENSHOTS_DIR, `${blockName}-storybook-iter${iteration}.png`);
  const storybookOutput = join(CROPS_DIR, `${blockName}-storybook-${areaName}.png`);

  if (!existsSync(storybookInput)) {
    console.error(`❌ Storybook screenshot not found: ${storybookInput}`);
    process.exit(1);
  }

  await sharp(storybookInput)
    .extract({
      left: cropArea.x,
      top: cropArea.y,
      width: cropArea.width,
      height: cropArea.height,
    })
    .toFile(storybookOutput);

  console.log(`✅ Cropped Storybook: ${storybookOutput}`);

  console.log(`\n📂 Cropped images saved to: ${CROPS_DIR}`);
  console.log(`\n💡 Drag these 2 images to Cursor Composer for detailed analysis:`);
  console.log(`   1. ${figmaOutput}`);
  console.log(`   2. ${storybookOutput}\n`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const blockArg = args.find(arg => arg.startsWith('--block='));
const areaArg = args.find(arg => arg.startsWith('--area='));
const iterArg = args.find(arg => arg.startsWith('--iteration='));

if (!blockArg || !areaArg) {
  console.error('Usage: node scripts/crop-for-analysis.js --block=<name> --area=<area-name> [--iteration=N]');
  console.error('');
  console.error('Available areas for hero:');
  console.error('  --area=heading   : Focus on heading text area');
  console.error('  --area=background: Focus on background image');
  console.error('  --area=full      : Full component (no crop)');
  process.exit(1);
}

const blockName = blockArg.split('=')[1];
const areaName = areaArg.split('=')[1];
const iteration = iterArg ? parseInt(iterArg.split('=')[1]) : 1;

cropScreenshots(blockName, areaName, iteration).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
