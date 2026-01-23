#!/usr/bin/env node

/**
 * Figma Styles Extractor
 * 
 * Extracts detailed style information from a Figma node and maps to CSS
 * 
 * Usage:
 *   node scripts/extract-figma-styles.js --node-id=<node-id> --block=<block-name>
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getFigmaConfig } from './utils/load-project-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const figmaConfig = getFigmaConfig();
const FIGMA_FILE_ID = figmaConfig.fileId;
const FIGMA_TOKEN = figmaConfig.accessToken;

// Load design tokens from styles.css
function loadDesignTokens() {
  const stylesPath = join(__dirname, '..', 'styles', 'styles.css');
  const stylesContent = readFileSync(stylesPath, 'utf-8');
  
  const tokens = {};
  const tokenRegex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  
  while ((match = tokenRegex.exec(stylesContent)) !== null) {
    tokens[match[1]] = match[2].trim();
  }
  
  return tokens;
}

// Load Figma Variables (design tokens) mapping
async function loadFigmaVariables() {
  if (!FIGMA_TOKEN) {
    return {};
  }
  
  try {
    const url = `${FIGMA_API_BASE}/files/${FIGMA_FILE_ID}/variables/local`;
    const response = await fetch(url, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN }
    });
    
    if (!response.ok) {
      console.warn('⚠️  Could not fetch Figma Variables, falling back to value matching');
      return {};
    }
    
    const data = await response.json();
    const variableMap = {};
    
    // Map Figma Variable ID to Variable Name
    if (data.meta && data.meta.variables) {
      Object.entries(data.meta.variables).forEach(([id, variable]) => {
        variableMap[id] = {
          name: variable.name,
          type: variable.resolvedType,
          value: variable.valuesByMode ? Object.values(variable.valuesByMode)[0] : null
        };
      });
    }
    
    return variableMap;
  } catch (error) {
    console.warn('⚠️  Error loading Figma Variables:', error.message);
    return {};
  }
}

// Get CSS token name from Figma Variable ID
function getTokenFromVariableId(variableId, figmaVariables, tokens) {
  if (!variableId || !figmaVariables[variableId]) {
    return null;
  }
  
  const variable = figmaVariables[variableId];
  const variableName = variable.name;
  
  // Try to find matching CSS token by name
  // Figma variable names often map to CSS token names
  // e.g., "spacing/xl" → "--spacing-xl"
  const tokenName = variableName.toLowerCase().replace(/[\/\s]+/g, '-');
  
  if (tokens[tokenName]) {
    return `--${tokenName}`;
  }
  
  // Try common prefixes
  const prefixes = ['', 'color-', 'spacing-', 'border-radius-', 'font-'];
  for (const prefix of prefixes) {
    const candidate = `${prefix}${tokenName}`;
    if (tokens[candidate]) {
      return `--${candidate}`;
    }
  }
  
  return null;
}

// Convert Figma color to CSS
function convertColor(color, opacity = 1) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a * opacity : opacity;
  
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
}

// Find matching design token for a value
function findTokenForValue(value, tokens, type = 'generic') {
  // Normalize value
  const normalizedValue = String(value).toLowerCase().trim();
  
  // Search tokens
  for (const [tokenName, tokenValue] of Object.entries(tokens)) {
    const normalizedTokenValue = String(tokenValue).toLowerCase().trim();
    
    if (normalizedTokenValue === normalizedValue) {
      return `--${tokenName}`;
    }
    
    // Handle px values
    if (normalizedValue === `${tokenValue}px` || `${normalizedValue}px` === tokenValue) {
      return `--${tokenName}`;
    }
  }
  
  return null;
}

// Convert Figma Auto Layout to CSS Flexbox
function convertAutoLayoutToCSS(node) {
  if (!node.layoutMode || node.layoutMode === 'NONE') {
    return {};
  }
  
  const css = {
    display: 'flex',
  };
  
  // Flex direction
  if (node.layoutMode === 'HORIZONTAL') {
    css['flex-direction'] = 'row';
  } else if (node.layoutMode === 'VERTICAL') {
    css['flex-direction'] = 'column';
  }
  
  // Justify content (primary axis)
  const justifyMap = {
    'MIN': 'flex-start',
    'CENTER': 'center',
    'MAX': 'flex-end',
    'SPACE_BETWEEN': 'space-between',
  };
  if (node.primaryAxisAlignItems && justifyMap[node.primaryAxisAlignItems]) {
    css['justify-content'] = justifyMap[node.primaryAxisAlignItems];
  }
  
  // Align items (counter axis)
  const alignMap = {
    'MIN': 'flex-start',
    'CENTER': 'center',
    'MAX': 'flex-end',
  };
  if (node.counterAxisAlignItems && alignMap[node.counterAxisAlignItems]) {
    css['align-items'] = alignMap[node.counterAxisAlignItems];
  }
  
  // Gap
  if (node.itemSpacing !== undefined) {
    css.gap = `${node.itemSpacing}px`;
  }
  
  return css;
}

// Extract styles from a Figma node
async function extractStylesFromNode(node, tokens, figmaVariables, depth = 0) {
  const styles = {
    nodeName: node.name,
    nodeType: node.type,
    styles: {},
    children: [],
  };
  
  // Layout
  const layoutStyles = convertAutoLayoutToCSS(node);
  if (Object.keys(layoutStyles).length > 0) {
    styles.styles.layout = layoutStyles;
  }
  
  // Sizing
  if (node.absoluteBoundingBox) {
    styles.styles.sizing = {
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height,
    };
  }
  
  // Spacing - CHECK boundVariables FIRST
  if (node.paddingTop !== undefined || node.paddingLeft !== undefined) {
    const paddingTop = node.paddingTop || 0;
    const paddingRight = node.paddingRight || 0;
    const paddingBottom = node.paddingBottom || 0;
    const paddingLeft = node.paddingLeft || 0;
    
    styles.styles.spacing = {
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
    };
    
    // Check if Figma Variables are bound
    const boundVars = node.boundVariables || {};
    styles.styles.spacingTokens = {
      paddingTop: boundVars.paddingTop 
        ? getTokenFromVariableId(boundVars.paddingTop.id, figmaVariables, tokens)
        : findTokenForValue(`${paddingTop}px`, tokens, 'spacing'),
      paddingRight: boundVars.paddingRight
        ? getTokenFromVariableId(boundVars.paddingRight.id, figmaVariables, tokens)
        : findTokenForValue(`${paddingRight}px`, tokens, 'spacing'),
      paddingBottom: boundVars.paddingBottom
        ? getTokenFromVariableId(boundVars.paddingBottom.id, figmaVariables, tokens)
        : findTokenForValue(`${paddingBottom}px`, tokens, 'spacing'),
      paddingLeft: boundVars.paddingLeft
        ? getTokenFromVariableId(boundVars.paddingLeft.id, figmaVariables, tokens)
        : findTokenForValue(`${paddingLeft}px`, tokens, 'spacing'),
    };
    
    // Mark if variable is from Figma
    styles.styles.spacingSource = {
      paddingTop: boundVars.paddingTop ? 'figma-variable' : 'value-match',
      paddingRight: boundVars.paddingRight ? 'figma-variable' : 'value-match',
      paddingBottom: boundVars.paddingBottom ? 'figma-variable' : 'value-match',
      paddingLeft: boundVars.paddingLeft ? 'figma-variable' : 'value-match',
    };
  }
  
  // Visual - Fills (background) - CHECK boundVariables FIRST
  if (node.fills && node.fills.length > 0 && node.fills[0].visible !== false) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      const color = convertColor(fill.color, fill.opacity);
      const boundVars = node.boundVariables || {};
      const fillToken = boundVars.fills && boundVars.fills[0]
        ? getTokenFromVariableId(boundVars.fills[0].id, figmaVariables, tokens)
        : findTokenForValue(color, tokens, 'color');
      
      styles.styles.fill = {
        type: 'solid',
        color,
        token: fillToken,
        source: boundVars.fills && boundVars.fills[0] ? 'figma-variable' : 'value-match',
      };
    }
  }
  
  // Visual - Strokes (border) - CHECK boundVariables FIRST
  if (node.strokes && node.strokes.length > 0 && node.strokes[0].visible !== false) {
    const stroke = node.strokes[0];
    if (stroke.type === 'SOLID') {
      const color = convertColor(stroke.color, stroke.opacity);
      const boundVars = node.boundVariables || {};
      const strokeToken = boundVars.strokes && boundVars.strokes[0]
        ? getTokenFromVariableId(boundVars.strokes[0].id, figmaVariables, tokens)
        : findTokenForValue(color, tokens, 'color');
      
      styles.styles.stroke = {
        type: 'solid',
        color,
        strokeWeight: node.strokeWeight,
        token: strokeToken,
        source: boundVars.strokes && boundVars.strokes[0] ? 'figma-variable' : 'value-match',
      };
    }
  }
  
  // Corner Radius - CHECK boundVariables FIRST
  if (node.cornerRadius !== undefined) {
    const boundVars = node.boundVariables || {};
    const radiusToken = boundVars.cornerRadius
      ? getTokenFromVariableId(boundVars.cornerRadius.id, figmaVariables, tokens)
      : findTokenForValue(`${node.cornerRadius}px`, tokens, 'border-radius');
    
    styles.styles.cornerRadius = {
      value: node.cornerRadius,
      token: radiusToken,
      source: boundVars.cornerRadius ? 'figma-variable' : 'value-match',
    };
  } else if (node.rectangleCornerRadii) {
    styles.styles.cornerRadius = {
      topLeft: node.rectangleCornerRadii[0],
      topRight: node.rectangleCornerRadii[1],
      bottomRight: node.rectangleCornerRadii[2],
      bottomLeft: node.rectangleCornerRadii[3],
    };
  }
  
  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    styles.styles.opacity = node.opacity;
  }
  
  // Effects (shadows, blurs)
  if (node.effects && node.effects.length > 0) {
    styles.styles.effects = node.effects
      .filter(effect => effect.visible !== false)
      .map(effect => ({
        type: effect.type,
        radius: effect.radius,
        offset: effect.offset,
        color: effect.color ? convertColor(effect.color) : undefined,
        spread: effect.spread,
      }));
  }
  
  // Typography (for TEXT nodes) - CHECK boundVariables FIRST
  if (node.type === 'TEXT' && node.style) {
    const boundVars = node.boundVariables || {};
    
    styles.styles.typography = {
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      lineHeightPx: node.style.lineHeightPx,
      lineHeightPercent: node.style.lineHeightPercent,
      letterSpacing: node.style.letterSpacing,
      textAlignHorizontal: node.style.textAlignHorizontal,
      textAlignVertical: node.style.textAlignVertical,
    };
    
    // Check for variable-bound typography properties
    styles.styles.typographyTokens = {
      fontSize: boundVars.fontSize
        ? getTokenFromVariableId(boundVars.fontSize.id, figmaVariables, tokens)
        : findTokenForValue(`${node.style.fontSize}px`, tokens, 'font-size'),
      fontWeight: boundVars.fontWeight
        ? getTokenFromVariableId(boundVars.fontWeight.id, figmaVariables, tokens)
        : null,
      lineHeight: boundVars.lineHeight
        ? getTokenFromVariableId(boundVars.lineHeight.id, figmaVariables, tokens)
        : null,
    };
  }
  
  // Recursively process children (limit depth to avoid excessive nesting)
  if (node.children && depth < 3) {
    styles.children = await Promise.all(
      node.children.map(child => extractStylesFromNode(child, tokens, figmaVariables, depth + 1))
    );
  }
  
  return styles;
}

async function extractFigmaStyles(nodeId, blockName) {
  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_PERSONAL_ACCESS_TOKEN not set');
  }
  
  console.log('🎨 Figma Styles Extractor\n');
  console.log(`   File ID: ${FIGMA_FILE_ID}`);
  console.log(`   Node ID: ${nodeId}`);
  console.log(`   Block: ${blockName}\n`);
  
  // Load design tokens
  console.log('📥 Loading design tokens from styles.css...');
  const tokens = loadDesignTokens();
  console.log(`   Found ${Object.keys(tokens).length} tokens\n`);
  
  // Load Figma Variables (for variable binding detection)
  console.log('📥 Loading Figma Variables...');
  const figmaVariables = await loadFigmaVariables();
  console.log(`   Found ${Object.keys(figmaVariables).length} Figma Variables\n`);
  
  // Fetch node data from Figma
  console.log('📥 Fetching Figma node data...');
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
  
  console.log(`✅ Node data fetched: ${nodeData.document.name}\n`);
  
  // Extract styles
  console.log('🔍 Extracting styles...');
  const extractedStyles = await extractStylesFromNode(nodeData.document, tokens, figmaVariables);
  
  // Save to file
  const outputDir = join(__dirname, '..', 'blocks', blockName);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = join(outputDir, 'figma-styles.json');
  writeFileSync(outputPath, JSON.stringify(extractedStyles, null, 2));
  
  console.log(`✅ Styles extracted and saved to: ${outputPath}\n`);
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Node Name: ${extractedStyles.nodeName}`);
  console.log(`   Node Type: ${extractedStyles.nodeType}`);
  console.log(`   Style Categories: ${Object.keys(extractedStyles.styles).join(', ')}`);
  console.log(`   Child Nodes: ${extractedStyles.children.length}\n`);
  
  // Count variable-bound properties
  let variableBoundCount = 0;
  let valueMatchCount = 0;
  
  function countSources(obj) {
    if (obj && typeof obj === 'object') {
      if (obj.source === 'figma-variable') variableBoundCount++;
      if (obj.source === 'value-match') valueMatchCount++;
      Object.values(obj).forEach(val => {
        if (typeof val === 'object') countSources(val);
      });
    }
  }
  
  countSources(extractedStyles);
  
  console.log('📊 Token Source Analysis:');
  console.log(`   From Figma Variables: ${variableBoundCount}`);
  console.log(`   From Value Matching: ${valueMatchCount}`);
  console.log(`   Total Design Tokens: ${variableBoundCount + valueMatchCount}\n`);
  
  return extractedStyles;
}

// Parse command line arguments
const args = process.argv.slice(2);
const nodeIdArg = args.find(arg => arg.startsWith('--node-id='));
const blockNameArg = args.find(arg => arg.startsWith('--block='));

if (!nodeIdArg || !blockNameArg) {
  console.error('Usage: node scripts/extract-figma-styles.js --node-id=<node-id> --block=<block-name>');
  console.error('Example: node scripts/extract-figma-styles.js --node-id=9392:121 --block=carousel');
  process.exit(1);
}

const nodeId = nodeIdArg.split('=')[1];
const blockName = blockNameArg.split('=')[1];

extractFigmaStyles(nodeId, blockName).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
