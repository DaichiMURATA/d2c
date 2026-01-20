#!/usr/bin/env node

/**
 * Parse Chromatic CLI output and extract visual changes count
 * Usage: node parse-chromatic-output.js chromatic-output.txt
 */

import fs from 'fs';

const outputFile = process.argv[2] || 'chromatic-output.txt';

if (!fs.existsSync(outputFile)) {
  console.error(`File not found: ${outputFile}`);
  process.exit(1);
}

const content = fs.readFileSync(outputFile, 'utf-8');

// Extract various metrics from Chromatic output
const metrics = {
  changes: 0,
  additions: 0,
  removals: 0,
  errors: 0,
  buildNumber: '',
  buildUrl: '',
};

// Pattern: "X changes"
const changesMatch = content.match(/(\d+)\s+change/i);
if (changesMatch) {
  metrics.changes = parseInt(changesMatch[1], 10);
}

// Pattern: "X stories with changes"
const storiesChangedMatch = content.match(/(\d+)\s+stor(?:y|ies)\s+with\s+changes/i);
if (storiesChangedMatch) {
  metrics.changes = parseInt(storiesChangedMatch[1], 10);
}

// Pattern: "Build XXXX" or "build XXXX"
const buildNumberMatch = content.match(/(?:Build|build)\s+(\d+)/);
if (buildNumberMatch) {
  metrics.buildNumber = buildNumberMatch[1];
}

// Pattern: "https://www.chromatic.com/build?..."
const buildUrlMatch = content.match(/(https:\/\/www\.chromatic\.com\/build\S+)/);
if (buildUrlMatch) {
  metrics.buildUrl = buildUrlMatch[1];
}

// Output as JSON
console.log(JSON.stringify(metrics, null, 2));
