#!/usr/bin/env node

/**
 * Generate EDS URL for GitHub Actions
 * 
 * Reads project.config.json and generates EDS URL based on branch and domain
 * 
 * Usage:
 *   node scripts/generate-eds-url.js <branch> <domain>
 *   node scripts/generate-eds-url.js feature-branch live
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateEdsUrl(branch, domain = 'live') {
  const configPath = join(__dirname, '..', 'config', 'project.config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  const pattern = config.eds.urlPattern;
  const domainName = config.eds.domains[domain] || domain;

  const url = pattern
    .replace('{branch}', branch)
    .replace('{project}', config.project.name)
    .replace('{owner}', config.eds.owner)
    .replace('{domain}', domainName);

  return `https://${url}`;
}

// Parse command line arguments
const args = process.argv.slice(2);
const branch = args[0] || 'main';
const domain = args[1] || 'live';

const url = generateEdsUrl(branch, domain);
console.log(url);
