#!/usr/bin/env node

/**
 * Figma Component Discovery
 * 
 * Scans a Figma file to find all Components and Component Sets with their Variants.
 * Useful for discovering component Node IDs to add to Storybook stories.
 * 
 * Usage:
 *   node scripts/discover-figma-components.js [--page=PageName] [--filter=ComponentName]
 *   
 * Examples:
 *   node scripts/discover-figma-components.js
 *   node scripts/discover-figma-components.js --page="Components"
 *   node scripts/discover-figma-components.js --filter=Cards
 */

import { getFigmaConfig } from './utils/load-project-config.js';

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const figmaConfig = getFigmaConfig();
const FIGMA_FILE_ID = figmaConfig.fileId;
const FIGMA_PERSONAL_ACCESS_TOKEN = figmaConfig.accessToken;

/**
 * Recursively traverse Figma node tree to find Components and Component Sets
 */
function findComponents(node, results = [], depth = 0) {
  // Check if this node is a Component or Component Set
  if (node.type === 'COMPONENT_SET') {
    const variants = (node.children || []).map(child => ({
      name: child.name,
      id: child.id,
      properties: child.variantProperties || {},
      size: {
        width: child.absoluteBoundingBox?.width,
        height: child.absoluteBoundingBox?.height,
      },
    }));

    results.push({
      type: 'COMPONENT_SET',
      name: node.name,
      id: node.id,
      variantCount: variants.length,
      variants,
      size: {
        width: node.absoluteBoundingBox?.width,
        height: node.absoluteBoundingBox?.height,
      },
    });
  } else if (node.type === 'COMPONENT') {
    // Skip if this is part of a Component Set (already captured above)
    if (!node.parent || node.parent.type !== 'COMPONENT_SET') {
      results.push({
        type: 'COMPONENT',
        name: node.name,
        id: node.id,
        size: {
          width: node.absoluteBoundingBox?.width,
          height: node.absoluteBoundingBox?.height,
        },
      });
    }
  }

  // Recursively search children
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => findComponents(child, results, depth + 1));
  }

  return results;
}

/**
 * Fetch Figma file and discover all components
 */
async function discoverComponents(pageFilter = null, nameFilter = null) {
  if (!FIGMA_PERSONAL_ACCESS_TOKEN) {
    throw new Error('FIGMA_PERSONAL_ACCESS_TOKEN not set. Please set it in your .env file or environment variables.');
  }

  console.log('🔍 Discovering Figma Components...\n');
  console.log(`   File ID: ${FIGMA_FILE_ID}`);
  if (pageFilter) console.log(`   Page Filter: "${pageFilter}"`);
  if (nameFilter) console.log(`   Name Filter: "${nameFilter}"`);
  console.log('');

  // Fetch the entire file
  const url = `${FIGMA_API_BASE}/files/${FIGMA_FILE_ID}`;
  
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
  const { document } = data;

  console.log(`📄 File: ${document.name}\n`);

  // Get pages to search
  const pages = document.children || [];
  console.log(`   Found ${pages.length} pages\n`);

  // Filter pages if specified
  const pagesToSearch = pageFilter
    ? pages.filter(page => page.name.toLowerCase().includes(pageFilter.toLowerCase()))
    : pages;

  if (pagesToSearch.length === 0) {
    console.log(`⚠️  No pages found matching filter: "${pageFilter}"\n`);
    console.log('   Available pages:');
    pages.forEach(page => console.log(`     - ${page.name}`));
    return;
  }

  // Search each page
  let allComponents = [];
  
  pagesToSearch.forEach(page => {
    console.log(`📄 Searching page: "${page.name}"`);
    const components = findComponents(page);
    
    // Apply name filter if specified
    const filteredComponents = nameFilter
      ? components.filter(c => c.name.toLowerCase().includes(nameFilter.toLowerCase()))
      : components;

    console.log(`   Found ${filteredComponents.length} components${nameFilter ? ` matching "${nameFilter}"` : ''}\n`);
    allComponents = allComponents.concat(filteredComponents.map(c => ({ ...c, page: page.name })));
  });

  if (allComponents.length === 0) {
    console.log('❌ No components found matching your criteria.\n');
    return;
  }

  // Display results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✨ Found ${allComponents.length} component(s)\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  allComponents.forEach((component, index) => {
    console.log(`\n[${index + 1}] 📦 ${component.name}`);
    console.log(`    Page: ${component.page}`);
    console.log(`    Type: ${component.type}`);
    console.log(`    Node ID: ${component.id}`);
    console.log(`    Size: ${component.size.width}x${component.size.height}px`);
    console.log(`    URL: https://www.figma.com/file/${FIGMA_FILE_ID}/SandBox-0108-AEM-Figma-Design-Framework?node-id=${component.id.replace(':', '-')}`);

    if (component.type === 'COMPONENT_SET') {
      console.log(`    Variants: ${component.variantCount}\n`);
      
      component.variants.forEach((variant, vIndex) => {
        console.log(`       [${vIndex + 1}] ${variant.name}`);
        console.log(`           Node ID: ${variant.id}`);
        console.log(`           Size: ${variant.size.width}x${variant.size.height}px`);
        console.log(`           URL: https://www.figma.com/file/${FIGMA_FILE_ID}/SandBox-0108-AEM-Figma-Design-Framework?node-id=${variant.id.replace(':', '-')}`);
        if (Object.keys(variant.properties).length > 0) {
          console.log(`           Properties: ${JSON.stringify(variant.properties)}`);
        }
        console.log('');
      });

      // Generate Storybook config snippet
      console.log('    💡 Storybook Stories Config:');
      console.log('    ```javascript');
      component.variants.forEach(variant => {
        const storyName = variant.name
          .split(',')[0]
          .replace(/Property \d+=/g, '')
          .trim()
          .replace(/\s+/g, '');
        console.log(`    export const ${storyName} = {`);
        console.log(`      parameters: {`);
        console.log(`        design: {`);
        console.log(`          type: 'figma',`);
        console.log(`          url: 'https://www.figma.com/file/${FIGMA_FILE_ID}/SandBox-0108-AEM-Figma-Design-Framework?node-id=${variant.id.replace(':', '-')}',`);
        console.log(`        },`);
        console.log(`      },`);
        console.log(`    };`);
        console.log('');
      });
      console.log('    ```');
    }
    
    console.log('    ─────────────────────────────────────────────────────────');
  });

  // Generate summary JSON
  console.log('\n\n📋 JSON Summary (for figma-urls.json):\n');
  console.log('```json');
  
  const jsonOutput = {};
  allComponents.forEach(component => {
    const key = component.name.toLowerCase().replace(/\s+/g, '-');
    
    if (component.type === 'COMPONENT_SET') {
      jsonOutput[key] = {
        url: `https://www.figma.com/file/${FIGMA_FILE_ID}/SandBox-0108-AEM-Figma-Design-Framework?node-id=${component.id.replace(':', '-')}`,
        nodeId: component.id,
        description: component.name,
        variants: {},
      };
      
      component.variants.forEach(variant => {
        const variantKey = variant.name
          .split(',')[0]
          .replace(/Property \d+=/g, '')
          .trim()
          .replace(/\s+/g, '');
        jsonOutput[key].variants[variantKey] = variant.id;
      });
    } else {
      jsonOutput[key] = {
        url: `https://www.figma.com/file/${FIGMA_FILE_ID}/SandBox-0108-AEM-Figma-Design-Framework?node-id=${component.id.replace(':', '-')}`,
        nodeId: component.id,
        description: component.name,
      };
    }
  });
  
  console.log(JSON.stringify(jsonOutput, null, 2));
  console.log('```\n');
}

// Parse command line arguments
const args = process.argv.slice(2);
const pageArg = args.find(arg => arg.startsWith('--page='));
const filterArg = args.find(arg => arg.startsWith('--filter='));

const pageFilter = pageArg ? pageArg.split('=')[1] : null;
const nameFilter = filterArg ? filterArg.split('=')[1] : null;

discoverComponents(pageFilter, nameFilter).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
