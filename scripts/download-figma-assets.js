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
import { getFigmaConfig } from './utils/load-project-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const figmaConfig = getFigmaConfig();
const FIGMA_FILE_ID = figmaConfig.fileId;
const FIGMA_TOKEN = figmaConfig.accessToken;

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
  
  // Check for IMAGE fills in any node type (COMPONENT, FRAME, RECTANGLE, etc.)
  // Check both 'fills' and 'background' properties
  const fillsToCheck = [
    ...(node.fills || []),
    ...(node.background || [])
  ];
  
  const hasImageFill = fillsToCheck.some(fill => fill && fill.type === 'IMAGE');
  
  if (hasImageFill) {
    // Get the imageRef from the first IMAGE fill
    const imageFill = fillsToCheck.find(fill => fill && fill.type === 'IMAGE');
    
    images.push({
      nodeId: node.id,
      nodeName: node.name,
      nodePath,
      type: `${node.type}_WITH_IMAGE`,
      imageRef: imageFill.imageRef,
    });
  }

  // Recursively search children
  if (node.children) {
    node.children.forEach(child => findImageNodes(child, images, nodePath));
  }

  return images;
}

async function downloadImageByRef(imageRef, outputPath) {
  console.log(`   📥 Downloading image via imageRef: ${imageRef}`);

  // Step 1: Get the file's image manifest to find the URL for this imageRef
  const manifestUrl = `${FIGMA_API_BASE}/files/${FIGMA_FILE_ID}/images`;
  
  const manifestResponse = await fetch(manifestUrl, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!manifestResponse.ok) {
    throw new Error(`Failed to fetch image manifest: ${manifestResponse.statusText}`);
  }

  const manifestData = await manifestResponse.json();
  
  // Step 2: Find the URL for this imageRef
  const imageUrl = manifestData.meta?.images?.[imageRef];
  
  if (!imageUrl) {
    throw new Error(`No URL found for imageRef ${imageRef} in file manifest`);
  }

  console.log(`   🔗 Found image URL in manifest`);

  // Step 3: Download the actual image file
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
    const filename = `${blockName}-background.png`;  // Use consistent naming for background images
    const outputPath = join(__dirname, '..', 'blocks', blockName, filename);

    try {
      console.log(`   📥 Processing node ${imageNode.nodeId} (${imageNode.type})`);
      console.log(`   📝 Node: ${imageNode.nodeName} at ${imageNode.nodePath}`);
      
      // Use imageRef if available (gets the actual image fill without any overlays)
      // Otherwise fall back to nodeId export (exports the whole node as rendered)
      if (imageNode.imageRef) {
        console.log(`   🎯 Using imageRef to download image fill only`);
        await downloadImageByRef(imageNode.imageRef, outputPath);
      } else {
        console.log(`   🎯 Using node export (may include text/overlays)`);
        await downloadImageNode(imageNode.nodeId, outputPath);
      }
      
      downloadedImages.push({
        ...imageNode,
        localPath: outputPath,
        relativePath: `./${filename}`,
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
