#!/usr/bin/env node

/**
 * Figma Assets Downloader
 * 
 * Downloads images and assets from Figma components for use in Storybook
 * 
 * Usage:
 *   node scripts/download-figma-assets.js --node-id=9392:121 --block=carousel
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID || 'MJTwyRbE5EVdlci3UIwsut';
const FIGMA_TOKEN = process.env.FIGMA_PERSONAL_ACCESS_TOKEN || process.env.FIGMA_ACCESS_TOKEN;

async function fetchNodeData(nodeId) {
  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_PERSONAL_ACCESS_TOKEN not set');
  }

  console.log('📥 Fetching Figma node data...\n');

  const url = `${FIGMA_API_BASE}/files/${FIGMA_FILE_ID}/nodes?ids=${nodeId}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const nodeData = data.nodes[nodeId];

  if (!nodeData) {
    throw new Error(`Node ${nodeId} not found`);
  }

  return nodeData.document;
}

function findImageNodes(node, images = [], parentName = '') {
  const nodePath = parentName ? `${parentName} > ${node.name}` : node.name;
  
  // Check if this node is an image (RECTANGLE with IMAGE fill)
  if (node.type === 'RECTANGLE' && node.fills) {
    const hasImageFill = node.fills.some(fill => fill.type === 'IMAGE');
    if (hasImageFill) {
      images.push({
        nodeId: node.id,
        nodeName: node.name,
        nodePath,
        type: 'RECTANGLE_WITH_IMAGE',
      });
    }
  }

  // Check if this is a direct IMAGE node (less common but possible)
  if (node.type === 'IMAGE') {
    images.push({
      nodeId: node.id,
      nodeName: node.name,
      nodePath,
      type: 'IMAGE',
    });
  }

  // Recursively search children
  if (node.children) {
    node.children.forEach(child => findImageNodes(child, images, nodePath));
  }

  return images;
}

async function downloadImageNode(nodeId, outputPath) {
  console.log(`   📥 Downloading image node: ${nodeId}`);

  // Export the node as PNG using Figma's image export API
  const url = `${FIGMA_API_BASE}/images/${FIGMA_FILE_ID}?ids=${nodeId}&format=png&scale=2`;
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch image URL: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  if (data.err) {
    throw new Error(`Figma API error: ${data.err}`);
  }
  
  // The API returns URLs for the exported images
  const imageUrl = data.images[nodeId];
  
  if (!imageUrl) {
    throw new Error(`No image URL returned for node ${nodeId}`);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.statusText}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  writeFileSync(outputPath, buffer);
  console.log(`   ✅ Saved to: ${outputPath}`);

  return outputPath;
}

async function extractComponentSize(nodeId) {
  const nodeData = await fetchNodeData(nodeId);
  
  if (nodeData.absoluteBoundingBox) {
    const { width, height } = nodeData.absoluteBoundingBox;
    console.log(`📐 Component size: ${width} x ${height}\n`);
    return { width, height };
  }

  return null;
}

async function downloadFigmaAssets(nodeId, blockName) {
  console.log('🎨 Figma Assets Downloader\n');
  console.log(`   File ID: ${FIGMA_FILE_ID}`);
  console.log(`   Node ID: ${nodeId}`);
  console.log(`   Block: ${blockName}\n`);

  // 1. Fetch node data
  const nodeData = await fetchNodeData(nodeId);

  // 2. Extract component size
  const size = nodeData.absoluteBoundingBox 
    ? { width: nodeData.absoluteBoundingBox.width, height: nodeData.absoluteBoundingBox.height }
    : null;

  if (size) {
    console.log(`📐 Component size: ${size.width} x ${size.height}\n`);
  }

  // 3. Find all images in the component
  console.log('🔍 Searching for images in component...\n');
  const imageNodes = findImageNodes(nodeData);

  if (imageNodes.length === 0) {
    console.log('   ℹ️  No images found in this component\n');
    return { size, images: [] };
  }

  console.log(`   Found ${imageNodes.length} image(s)\n`);

  // 4. Create output directory
  const outputDir = join(__dirname, '..', 'blocks', blockName, 'assets');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }

  // 5. Download all images
  console.log('📥 Downloading images...\n');
  const downloadedImages = [];

  for (let i = 0; i < imageNodes.length; i++) {
    const imageNode = imageNodes[i];
    const safeNodeName = imageNode.nodeName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${safeNodeName || `image-${i + 1}`}.png`;
    const outputPath = join(outputDir, filename);

    try {
      await downloadImageNode(imageNode.nodeId, outputPath);
      downloadedImages.push({
        ...imageNode,
        localPath: outputPath,
        relativePath: `./assets/${filename}`,
      });
    } catch (error) {
      console.error(`   ❌ Failed to download ${imageNode.nodeId}: ${error.message}`);
    }
  }

  // 6. Generate metadata file
  const metadata = {
    figmaFileId: FIGMA_FILE_ID,
    figmaNodeId: nodeId,
    blockName,
    size,
    images: downloadedImages.map(img => ({
      nodeName: img.nodeName,
      nodePath: img.nodePath,
      nodeId: img.nodeId,
      type: img.type,
      relativePath: img.relativePath,
    })),
    downloadedAt: new Date().toISOString(),
  };

  const metadataPath = join(outputDir, 'metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`\n✅ Download complete!`);
  console.log(`   Downloaded: ${downloadedImages.length} image(s)`);
  console.log(`   Metadata: ${metadataPath}\n`);

  return metadata;
}

// Parse command line arguments
const args = process.argv.slice(2);
const nodeIdArg = args.find(arg => arg.startsWith('--node-id='));
const blockNameArg = args.find(arg => arg.startsWith('--block='));

if (!nodeIdArg || !blockNameArg) {
  console.error('Usage: node scripts/download-figma-assets.js --node-id=<node-id> --block=<block-name>');
  console.error('Example: node scripts/download-figma-assets.js --node-id=9392:121 --block=carousel');
  process.exit(1);
}

const nodeId = nodeIdArg.split('=')[1];
const blockName = blockNameArg.split('=')[1];

downloadFigmaAssets(nodeId, blockName).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
