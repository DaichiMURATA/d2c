#!/usr/bin/env node

/**
 * Converts Figma Variables to CSS Custom Properties
 * Reads figma-variables-raw.json and generates CSS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts Figma RGBA color to hex
 */
function rgbaToHex(rgba) {
  const r = Math.round(rgba.r * 255);
  const g = Math.round(rgba.g * 255);
  const b = Math.round(rgba.b * 255);
  const { a } = rgba;

  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  if (a < 1) {
    const alpha = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${hex}${alpha}`;
  }

  return hex;
}

/**
 * Converts Figma variable name to CSS custom property
 * Example: "typography/heading/40/size" -> "--typography-heading-40-size"
 */
function toCSSVarName(name) {
  return `--${name.toLowerCase().replace(/\//g, '-')}`;
}

/**
 * Formats a value based on type
 */
function formatValue(variable, valuesByMode, allVariables) {
  const type = variable.resolvedType;
  const value = valuesByMode[Object.keys(valuesByMode)[0]]; // Use first mode

  if (!value) return null;

  // Handle alias references - resolve them
  if (typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    const aliasedVar = allVariables[value.id];
    if (aliasedVar) {
      return `var(${toCSSVarName(aliasedVar.name)})`;
    }
    return null; // Can't resolve alias
  }

  switch (type) {
    case 'COLOR':
      return rgbaToHex(value);
    case 'FLOAT':
      // Check if it's a unitless number (like line-height)
      if (variable.name.includes('line-height') || variable.name.includes('weight')) {
        return value.toString();
      }
      return `${value}px`;
    case 'STRING':
      return value;
    case 'BOOLEAN':
      return value ? 'true' : 'false';
    default:
      return value;
  }
}

/**
 * Groups variables by category
 */
function groupVariables(variables) {
  const groups = {
    colors: [],
    typography: [],
    spacing: [],
    border: [],
    shadows: [],
    effects: [],
    other: [],
  };

  Object.entries(variables).forEach(([id, variable]) => {
    const name = variable.name.toLowerCase();

    if (name.startsWith('color/') || name.includes('color')) {
      groups.colors.push({ id, ...variable });
    } else if (name.startsWith('typography/')) {
      groups.typography.push({ id, ...variable });
    } else if (name.startsWith('spacing/') || name.startsWith('gap/') || name.startsWith('padding/') || name.startsWith('margin/')) {
      groups.spacing.push({ id, ...variable });
    } else if (name.startsWith('border/') || name.includes('radius')) {
      groups.border.push({ id, ...variable });
    } else if (name.includes('shadow')) {
      groups.shadows.push({ id, ...variable });
    } else if (name.includes('effect') || name.includes('blur')) {
      groups.effects.push({ id, ...variable });
    } else {
      groups.other.push({ id, ...variable });
    }
  });

  return groups;
}

/**
 * Generates CSS content
 */
function generateCSS(groups, allVariables) {
  let css = `/*
 * Design Tokens extracted from Figma
 * File: SandBox 0108-AEM Figma Design Framework
 * Generated: ${new Date().toISOString().split('T')[0]}
 * 
 * These variables are automatically generated from Figma Variables.
 * Do not edit manually - regenerate using: npm run extract-figma-tokens
 */

:root {
`;

  // Colors
  if (groups.colors.length > 0) {
    css += '  /* ========================================\n';
    css += '     Colors\n';
    css += '     ======================================== */\n';
    groups.colors.forEach((variable) => {
      const name = toCSSVarName(variable.name);
      const value = formatValue(variable, variable.valuesByMode, allVariables);
      if (value) {
        css += `  ${name}: ${value};\n`;
      }
    });
    css += '\n';
  }

  // Typography
  if (groups.typography.length > 0) {
    css += '  /* ========================================\n';
    css += '     Typography\n';
    css += '     ======================================== */\n';
    groups.typography.forEach((variable) => {
      const name = toCSSVarName(variable.name);
      const value = formatValue(variable, variable.valuesByMode, allVariables);
      if (value) {
        css += `  ${name}: ${value};\n`;
      }
    });
    css += '\n';
  }

  // Spacing
  if (groups.spacing.length > 0) {
    css += '  /* ========================================\n';
    css += '     Spacing\n';
    css += '     ======================================== */\n';
    groups.spacing.forEach((variable) => {
      const name = toCSSVarName(variable.name);
      const value = formatValue(variable, variable.valuesByMode, allVariables);
      if (value) {
        css += `  ${name}: ${value};\n`;
      }
    });
    css += '\n';
  }

  // Border
  if (groups.border.length > 0) {
    css += '  /* ========================================\n';
    css += '     Border\n';
    css += '     ======================================== */\n';
    groups.border.forEach((variable) => {
      const name = toCSSVarName(variable.name);
      const value = formatValue(variable, variable.valuesByMode, allVariables);
      if (value) {
        css += `  ${name}: ${value};\n`;
      }
    });
    css += '\n';
  }

  // Shadows
  if (groups.shadows.length > 0) {
    css += '  /* ========================================\n';
    css += '     Shadows & Effects\n';
    css += '     ======================================== */\n';
    groups.shadows.forEach((variable) => {
      const name = toCSSVarName(variable.name);
      const value = formatValue(variable, variable.valuesByMode, allVariables);
      if (value) {
        css += `  ${name}: ${value};\n`;
      }
    });
    css += '\n';
  }

  // Other
  if (groups.other.length > 0) {
    css += '  /* ========================================\n';
    css += '     Other\n';
    css += '     ======================================== */\n';
    groups.other.forEach((variable) => {
      const name = toCSSVarName(variable.name);
      const value = formatValue(variable, variable.valuesByMode, allVariables);
      if (value) {
        css += `  ${name}: ${value};\n`;
      }
    });
  }

  css += '}\n';

  return css;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔍 Reading Figma Variables...');

    const inputPath = path.join(__dirname, '..', 'figma-variables-raw.json');
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

    if (!rawData.meta || !rawData.meta.variables) {
      throw new Error('Invalid Figma Variables data structure');
    }

    console.log(`📊 Found ${Object.keys(rawData.meta.variables).length} variables`);

    // Group variables by category
    const groups = groupVariables(rawData.meta.variables);

    console.log(`  - Colors: ${groups.colors.length}`);
    console.log(`  - Typography: ${groups.typography.length}`);
    console.log(`  - Spacing: ${groups.spacing.length}`);
    console.log(`  - Border: ${groups.border.length}`);
    console.log(`  - Shadows: ${groups.shadows.length}`);
    console.log(`  - Other: ${groups.other.length}`);

    // Generate CSS
    console.log('🎨 Generating CSS...');
    const css = generateCSS(groups, rawData.meta.variables);

    // Write to file
    const outputPath = path.join(__dirname, '..', 'styles', 'design-tokens.css');
    fs.writeFileSync(outputPath, css);

    console.log(`✅ Design tokens written to: ${outputPath}`);
    console.log(`📏 File size: ${(css.length / 1024).toFixed(2)}KB`);

    // Also save a summary JSON
    const summaryPath = path.join(__dirname, '..', 'figma-variables-summary.json');
    const summary = {
      generated: new Date().toISOString(),
      totalVariables: Object.keys(rawData.meta.variables).length,
      groups: {
        colors: groups.colors.length,
        typography: groups.typography.length,
        spacing: groups.spacing.length,
        border: groups.border.length,
        shadows: groups.shadows.length,
        other: groups.other.length,
      },
    };
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('✅ Complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
