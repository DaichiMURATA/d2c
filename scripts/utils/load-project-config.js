/**
 * Project Configuration Loader
 * 
 * Loads project configuration from config/project.config.json
 * and environment variables from .env file
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedConfig = null;

/**
 * Load project configuration from config/project.config.json
 * @returns {Object} Project configuration
 */
export function loadProjectConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = join(__dirname, '../../config/project.config.json');
  
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    cachedConfig = JSON.parse(configContent);
    
    // Check if config has placeholder values
    const configStr = JSON.stringify(cachedConfig);
    if (configStr.includes('{{')) {
      console.warn('⚠️  Warning: project.config.json contains placeholder values.');
      console.warn('   Run "npm run init-project" to configure your project.');
    }
    
    return cachedConfig;
  } catch (error) {
    console.error('❌ Failed to load project configuration:', error.message);
    console.error('   Make sure config/project.config.json exists.');
    console.error('   Run "npm run init-project" to create it.');
    process.exit(1);
  }
}

/**
 * Get Figma configuration
 * Combines public config from project.config.json and access token from .env
 * @returns {Object} Figma configuration with fileId, fileUrl, projectName, and accessToken
 */
export function getFigmaConfig() {
  const config = loadProjectConfig();
  const accessToken = process.env.FIGMA_PERSONAL_ACCESS_TOKEN || process.env.FIGMA_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('❌ FIGMA_PERSONAL_ACCESS_TOKEN is not set');
    console.error('   Please add it to your .env file:');
    console.error('   FIGMA_PERSONAL_ACCESS_TOKEN=figd_your_token_here');
    console.error('');
    console.error('   Get your token at: https://www.figma.com/developers/api#access-tokens');
    process.exit(1);
  }

  return {
    fileId: config.figma.fileId,
    fileUrl: config.figma.fileUrl,
    projectName: config.figma.projectName,
    accessToken,
  };
}

/**
 * Generate EDS URL for a specific branch and domain
 * @param {string} branch - Branch name (default: 'main')
 * @param {string} domain - Domain type: 'live' or 'page' (default: 'live')
 * @returns {string} Generated EDS URL
 */
export function getEdsUrl(branch = 'main', domain = 'live') {
  const config = loadProjectConfig();

  const pattern = config.eds.urlPattern;
  const domainName = config.eds.domains[domain] || domain;

  const url = pattern
    .replace('{branch}', branch)
    .replace('{project}', config.project.name)
    .replace('{owner}', config.eds.owner)
    .replace('{domain}', domainName);

  return `https://${url}`;
}

/**
 * Get Chromatic configuration
 * @param {string} layer - 'storybook' or 'playwright'
 * @returns {Object} Chromatic configuration with appId and token from environment
 */
export function getChromaticConfig(layer = 'storybook') {
  const config = loadProjectConfig();

  if (!config.chromatic || !config.chromatic[layer]) {
    console.error(`❌ Chromatic configuration for "${layer}" not found in project.config.json`);
    process.exit(1);
  }

  const chromaticConfig = config.chromatic[layer];

  return {
    appIdVar: chromaticConfig.appIdVar,
    tokenSecret: chromaticConfig.tokenSecret,
    appId: process.env[chromaticConfig.appIdVar],
    token: process.env[chromaticConfig.tokenSecret],
  };
}

/**
 * Get Storybook configuration
 * @returns {Object} Storybook configuration with url and port
 */
export function getStorybookConfig() {
  const config = loadProjectConfig();
  return config.storybook || {
    url: 'http://localhost:6006',
    port: 6006,
  };
}

/**
 * Get project metadata
 * @returns {Object} Project metadata (name, description, version)
 */
export function getProjectInfo() {
  const config = loadProjectConfig();
  return config.project;
}

/**
 * Get repository information
 * @returns {Object} Repository information (owner, name, url, etc.)
 */
export function getRepositoryInfo() {
  const config = loadProjectConfig();
  return config.repository;
}
