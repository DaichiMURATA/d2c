#!/usr/bin/env node

/**
 * Figma Node Inspector
 * 
 * Inspects Figma nodes to find individual Component Variants within a Component Set
 * This helps to get accurate Node IDs for screenshot comparison.
 * 
 * Usage:
 *   node scripts/inspect-figma-nodes.js --node-id=9392:122
 */

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID || 'MJTwyRbE5EVdlci3UIwsut';
const FIGMA_PERSONAL_ACCESS_TOKEN = process.env.FIGMA_PERSONAL_ACCESS_TOKEN || process.env.FIGMA_ACCESS_TOKEN;

async function inspectNode(nodeId) {
  if (!FIGMA_PERSONAL_ACCESS_TOKEN) {
    throw new Error('FIGMA_PERSONAL_ACCESS_TOKEN not set');
  }

  console.log('🔍 Inspecting Figma Node...\n');
  console.log(`   File ID: ${FIGMA_FILE_ID}`);
  console.log(`   Node ID: ${nodeId}\n`);

  const url = `${FIGMA_API_BASE}/files/${FIGMA_FILE_ID}/nodes?ids=${nodeId}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_PERSONAL_ACCESS_TOKEN,
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

  console.log('📦 Node Information:\n');
  console.log(`   Name: ${nodeData.document.name}`);
  console.log(`   Type: ${nodeData.document.type}`);
  console.log(`   Size: ${nodeData.document.absoluteBoundingBox?.width || 'N/A'} x ${nodeData.document.absoluteBoundingBox?.height || 'N/A'}\n`);

  // Check if this is a Component Set with Variants
  if (nodeData.document.type === 'COMPONENT_SET') {
    console.log('🎨 This is a Component Set! Found variants:\n');
    const variants = nodeData.document.children || [];
    
    variants.forEach((variant, index) => {
      console.log(`   [${index + 1}] ${variant.name}`);
      console.log(`       Node ID: ${variant.id}`);
      console.log(`       Type: ${variant.type}`);
      console.log(`       Size: ${variant.absoluteBoundingBox?.width || 'N/A'} x ${variant.absoluteBoundingBox?.height || 'N/A'}`);
      
      // Extract variant properties if available
      if (variant.variantProperties) {
        console.log(`       Properties: ${JSON.stringify(variant.variantProperties)}`);
      }
      console.log('');
    });

    console.log('💡 Tip: Use individual Variant Node IDs for accurate screenshot comparison\n');
    
    // Generate config snippet
    console.log('📝 Suggested config update (config/figma/figma-urls.json):\n');
    console.log('```json');
    console.log('"variants": {');
    variants.forEach((variant, index) => {
      const variantName = variant.name.split(',')[0].replace('Property 1=', '').trim();
      console.log(`  "${variantName}": "${variant.id}"${index < variants.length - 1 ? ',' : ''}`);
    });
    console.log('}');
    console.log('```\n');
  } else if (nodeData.document.type === 'COMPONENT') {
    console.log('✅ This is a single Component (one Variant)\n');
    console.log('   This Node ID is ready to use for screenshot comparison.\n');
  } else {
    console.log('⚠️  This node is neither a Component Set nor a Component\n');
    console.log('   Node Type:', nodeData.document.type);
    
    // Check if it has children
    if (nodeData.document.children && nodeData.document.children.length > 0) {
      console.log(`\n   Found ${nodeData.document.children.length} child nodes:\n`);
      nodeData.document.children.slice(0, 10).forEach((child, index) => {
        console.log(`   [${index + 1}] ${child.name} (${child.type}, ID: ${child.id})`);
      });
      
      if (nodeData.document.children.length > 10) {
        console.log(`   ... and ${nodeData.document.children.length - 10} more\n`);
      }
    }
  }

  return nodeData;
}

// Parse command line arguments
const args = process.argv.slice(2);
const nodeIdArg = args.find(arg => arg.startsWith('--node-id='));

if (!nodeIdArg) {
  console.error('Usage: node scripts/inspect-figma-nodes.js --node-id=<node-id>');
  console.error('Example: node scripts/inspect-figma-nodes.js --node-id=9392:122');
  process.exit(1);
}

const nodeId = nodeIdArg.split('=')[1];

inspectNode(nodeId).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
