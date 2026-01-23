#!/usr/bin/env node

/**
 * Project Initialization Script
 * 
 * Interactive setup wizard for d2c projects
 * Creates project.config.json and updates related files
 * 
 * Usage:
 *   npm run init-project
 */

import inquirer from 'inquirer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = join(__dirname, '..', 'config', 'project.config.json');
const PACKAGE_JSON_PATH = join(__dirname, '..', 'package.json');
const CHROMATIC_PAGES_CONFIG_PATH = join(__dirname, '..', 'config', 'chromatic', 'chromatic-pages.config.json');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 d2c Project Initialization');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('This wizard will help you configure your d2c project.');
console.log('You can change these settings later by editing config/project.config.json\n');

async function run() {
  // Check if already configured
  let existingConfig = null;
  if (existsSync(CONFIG_PATH)) {
    const configContent = readFileSync(CONFIG_PATH, 'utf-8');
    if (!configContent.includes('{{')) {
      console.log('⚠️  Project is already configured.');
      const { reconfigure } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'reconfigure',
          message: 'Do you want to reconfigure?',
          default: false,
        },
      ]);
      
      if (!reconfigure) {
        console.log('\n✅ Keeping existing configuration.');
        process.exit(0);
      }
      
      existingConfig = JSON.parse(configContent);
    }
  }

  // Interactive prompts
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name (used in URLs):',
      default: existingConfig?.project?.name || 'd2c',
      validate: (input) => {
        if (input.length === 0) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) return 'Only lowercase letters, numbers, and hyphens allowed';
        return true;
      },
    },
    {
      type: 'input',
      name: 'projectDescription',
      message: 'Project description:',
      default: existingConfig?.project?.description || 'EDS project with design-to-code automation',
    },
    {
      type: 'input',
      name: 'githubOwner',
      message: 'GitHub repository owner (user or organization):',
      default: existingConfig?.repository?.owner || 'my-org',
      validate: (input) => input.length > 0 || 'GitHub owner is required',
    },
    {
      type: 'input',
      name: 'edsOwner',
      message: 'EDS owner (usually same as GitHub owner):',
      default: (answers) => existingConfig?.eds?.owner || answers.githubOwner,
      validate: (input) => input.length > 0 || 'EDS owner is required',
    },
    {
      type: 'input',
      name: 'figmaFileId',
      message: 'Figma File ID (from Figma URL):',
      default: existingConfig?.figma?.fileId,
      validate: (input) => {
        if (input.length === 0) return 'Figma File ID is required';
        if (!/^[a-zA-Z0-9]+$/.test(input)) return 'Invalid Figma File ID format';
        return true;
      },
    },
    {
      type: 'input',
      name: 'figmaFileUrl',
      message: 'Figma File URL:',
      default: existingConfig?.figma?.fileUrl || (answers) => `https://www.figma.com/design/${answers.figmaFileId}/`,
      validate: (input) => {
        if (!input.startsWith('https://www.figma.com/')) {
          return 'Must be a valid Figma URL starting with https://www.figma.com/';
        }
        return true;
      },
    },
  ]);

  // Generate configuration
  const config = {
    $schema: './project.config.schema.json',
    project: {
      name: answers.projectName,
      description: answers.projectDescription,
      version: existingConfig?.project?.version || '1.0.0',
    },
    repository: {
      owner: answers.githubOwner,
      name: answers.projectName,
      url: `https://github.com/${answers.githubOwner}/${answers.projectName}.git`,
      issues: `https://github.com/${answers.githubOwner}/${answers.projectName}/issues`,
      homepage: `https://github.com/${answers.githubOwner}/${answers.projectName}#readme`,
    },
    eds: {
      owner: answers.edsOwner,
      urlPattern: '{branch}--{project}--{owner}.aem.{domain}',
      domains: {
        live: 'aem.live',
        page: 'aem.page',
      },
      baseUrls: {
        live: `https://main--${answers.projectName}--${answers.edsOwner}.aem.live`,
        page: `https://main--${answers.projectName}--${answers.edsOwner}.aem.page`,
      },
    },
    figma: {
      fileId: answers.figmaFileId,
      fileUrl: answers.figmaFileUrl,
      projectName: answers.projectName,
    },
    chromatic: existingConfig?.chromatic || {
      storybook: {
        appIdVar: 'CHROMATIC_STORYBOOK_APP_ID',
        tokenSecret: 'CHROMATIC_STORYBOOK_TOKEN',
      },
      playwright: {
        appIdVar: 'CHROMATIC_PLAYWRIGHT_APP_ID',
        tokenSecret: 'CHROMATIC_PLAYWRIGHT_TOKEN',
      },
    },
    storybook: existingConfig?.storybook || {
      url: 'http://localhost:6006',
      port: 6006,
    },
  };

  // Save project.config.json
  console.log('\n📝 Saving configuration...\n');
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log('✅ Created: config/project.config.json');

  // Update package.json
  updatePackageJson(config);

  // Update chromatic-pages.config.json
  updateChromaticPagesConfig(config);

  // Display next steps
  displayNextSteps(config);
}

function updatePackageJson(config) {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  
  packageJson.name = `@${config.repository.owner}/${config.project.name}`;
  packageJson.description = config.project.description;
  packageJson.version = config.project.version;
  packageJson.repository = {
    type: 'git',
    url: config.repository.url,
  };
  packageJson.bugs = {
    url: config.repository.issues,
  };
  packageJson.homepage = config.repository.homepage;
  
  writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated: package.json');
}

function updateChromaticPagesConfig(config) {
  if (existsSync(CHROMATIC_PAGES_CONFIG_PATH)) {
    const chromaticPages = JSON.parse(readFileSync(CHROMATIC_PAGES_CONFIG_PATH, 'utf-8'));
    chromaticPages.baseUrl = config.eds.baseUrls.live;
    writeFileSync(CHROMATIC_PAGES_CONFIG_PATH, JSON.stringify(chromaticPages, null, 2) + '\n');
    console.log('✅ Updated: config/chromatic/chromatic-pages.config.json');
  }
}

function displayNextSteps(config) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Project Configuration Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 Configuration Summary:');
  console.log(`   Project: ${config.project.name}`);
  console.log(`   GitHub: https://github.com/${config.repository.owner}/${config.project.name}`);
  console.log(`   EDS Live: ${config.eds.baseUrls.live}`);
  console.log(`   Figma: ${config.figma.fileUrl}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Next Steps:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1️⃣  LOCAL DEVELOPMENT SETUP');
  console.log('   Create a .env file with your Figma token:\n');
  console.log('   cp .env.example .env');
  console.log('   # Then edit .env and add your token\n');
  console.log('   📖 Get token: https://www.figma.com/developers/api#access-tokens\n');

  console.log('2️⃣  INSTALL DEPENDENCIES');
  console.log('   npm install\n');

  console.log('3️⃣  GITHUB REPOSITORY SETUP');
  console.log('   If you haven\'t already, push to GitHub:\n');
  console.log('   git add .');
  console.log(`   git commit -m "Initialize project: ${config.project.name}"`);
  console.log(`   git remote set-url origin ${config.repository.url}`);
  console.log('   git push -u origin main\n');

  console.log('4️⃣  GITHUB SECRETS (Required for CI/CD)');
  console.log('   Go to: Settings > Secrets and variables > Actions > Secrets\n');
  console.log('   Add these 2 secrets:');
  console.log('   ├─ CHROMATIC_STORYBOOK_TOKEN');
  console.log('   └─ CHROMATIC_PLAYWRIGHT_TOKEN\n');
  console.log('   📖 Get tokens: https://www.chromatic.com/start\n');

  console.log('5️⃣  GITHUB VARIABLES (Required for CI/CD)');
  console.log('   Go to: Settings > Secrets and variables > Actions > Variables\n');
  console.log('   Add these 2 variables:');
  console.log('   ├─ CHROMATIC_STORYBOOK_APP_ID');
  console.log('   └─ CHROMATIC_PLAYWRIGHT_APP_ID\n');
  console.log('   📖 Find in Chromatic dashboard\n');

  console.log('6️⃣  START DEVELOPING');
  console.log('   npm run storybook          # Start Storybook');
  console.log('   npm run validate-block     # Validate blocks');
  console.log('   npm run test:chromatic     # Run visual tests\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Documentation:');
  console.log('   README.md              - Project overview');
  console.log('   config/README.md       - Configuration guide');
  console.log('   docs/                  - Detailed documentation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the script
run().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
