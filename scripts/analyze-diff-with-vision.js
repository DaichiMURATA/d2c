#!/usr/bin/env node

/**
 * Vision LLM Diff Analyzer
 * 
 * Analyzes visual differences between Figma design and Storybook implementation
 * using Vision-capable LLM (Claude Sonnet 4 or GPT-4V)
 * 
 * Usage:
 *   node scripts/analyze-diff-with-vision.js --block=<block-name> --iteration=<number>
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = join(__dirname, '..', '.validation-screenshots');

// Use Anthropic Claude (preferred) or OpenAI GPT-4V
const USE_ANTHROPIC = true; // Set to false to use OpenAI instead

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Convert image to base64
function imageToBase64(imagePath) {
  const imageBuffer = readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

// Analyze with Claude Sonnet 4
async function analyzeWithClaude(figmaImagePath, storybookImagePath, diffImagePath) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  const figmaImage = imageToBase64(figmaImagePath);
  const storybookImage = imageToBase64(storybookImagePath);
  const diffImage = imageToBase64(diffImagePath);

  const prompt = `You are a UI/UX expert analyzing visual differences between a Figma design and its implementation.

I'm providing you with 3 images:
1. **Figma Design** (ideal/target)
2. **Storybook Implementation** (current)
3. **Pixel Difference** (highlighted differences in pink/red)

Your task:
1. Identify ALL visual differences between Figma and Storybook
2. For each difference, provide:
   - Element name (e.g., "Carousel indicators", "Navigation buttons")
   - What is different (e.g., "spacing too small", "color mismatch", "position offset")
   - CSS property to fix (e.g., "gap", "background-color", "top")
   - Expected value from Figma (e.g., "16px", "#e0e0e0", "50%")
   - Current value in Storybook (approximate, if visible)
   - Priority: High/Medium/Low

Return your analysis as JSON in this exact format:
\`\`\`json
{
  "overallAssessment": "Brief summary of main issues",
  "differences": [
    {
      "element": "Element name",
      "issue": "Description of what's different",
      "cssProperty": "property-name",
      "expectedValue": "value from Figma",
      "currentValue": "value in Storybook (if known)",
      "priority": "High|Medium|Low",
      "reasoning": "Why this fix is needed"
    }
  ],
  "additionalNotes": "Any other observations"
}
\`\`\`

Be precise and focus on actionable CSS fixes.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: figmaImage,
              },
            },
            {
              type: 'text',
              text: '**Image 1: Figma Design (Target)**',
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: storybookImage,
              },
            },
            {
              type: 'text',
              text: '**Image 2: Storybook Implementation (Current)**',
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: diffImage,
              },
            },
            {
              type: 'text',
              text: '**Image 3: Pixel Difference (Pink = different)**',
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Extract JSON from response
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from Claude response');
  }

  return JSON.parse(jsonMatch[1]);
}

// Analyze with GPT-4V
async function analyzeWithGPT4V(figmaImagePath, storybookImagePath, diffImagePath) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const figmaImage = imageToBase64(figmaImagePath);
  const storybookImage = imageToBase64(storybookImagePath);
  const diffImage = imageToBase64(diffImagePath);

  const prompt = `You are a UI/UX expert analyzing visual differences between a Figma design and its implementation.

I'm providing you with 3 images:
1. **Figma Design** (ideal/target)
2. **Storybook Implementation** (current)
3. **Pixel Difference** (highlighted differences in pink/red)

Your task:
1. Identify ALL visual differences between Figma and Storybook
2. For each difference, provide:
   - Element name (e.g., "Carousel indicators", "Navigation buttons")
   - What is different (e.g., "spacing too small", "color mismatch", "position offset")
   - CSS property to fix (e.g., "gap", "background-color", "top")
   - Expected value from Figma (e.g., "16px", "#e0e0e0", "50%")
   - Current value in Storybook (approximate, if visible)
   - Priority: High/Medium/Low

Return your analysis as JSON in this exact format:
\`\`\`json
{
  "overallAssessment": "Brief summary of main issues",
  "differences": [
    {
      "element": "Element name",
      "issue": "Description of what's different",
      "cssProperty": "property-name",
      "expectedValue": "value from Figma",
      "currentValue": "value in Storybook (if known)",
      "priority": "High|Medium|Low",
      "reasoning": "Why this fix is needed"
    }
  ],
  "additionalNotes": "Any other observations"
}
\`\`\`

Be precise and focus on actionable CSS fixes.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '**Image 1: Figma Design (Target)**',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${figmaImage}`,
              },
            },
            {
              type: 'text',
              text: '**Image 2: Storybook Implementation (Current)**',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${storybookImage}`,
              },
            },
            {
              type: 'text',
              text: '**Image 3: Pixel Difference (Pink = different)**',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${diffImage}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Extract JSON from response
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from GPT-4V response');
  }

  return JSON.parse(jsonMatch[1]);
}

async function analyzeDiff(blockName, iteration) {
  console.log('🔍 Vision LLM Diff Analyzer\n');
  console.log(`   Block: ${blockName}`);
  console.log(`   Iteration: ${iteration}`);
  console.log(`   LLM: ${USE_ANTHROPIC ? 'Claude Sonnet 4' : 'GPT-4V'}\n`);

  // Check if screenshots exist
  const figmaImagePath = join(SCREENSHOTS_DIR, `${blockName}-figma-iter1.png`);
  const storybookImagePath = join(SCREENSHOTS_DIR, `${blockName}-storybook-iter${iteration}.png`);
  const diffImagePath = join(SCREENSHOTS_DIR, `${blockName}-diff-iter${iteration}.png`);

  if (!existsSync(figmaImagePath) || !existsSync(storybookImagePath) || !existsSync(diffImagePath)) {
    throw new Error('Screenshots not found. Run validate-block first.');
  }

  console.log('📸 Loading screenshots...');
  console.log(`   Figma: ${figmaImagePath}`);
  console.log(`   Storybook: ${storybookImagePath}`);
  console.log(`   Diff: ${diffImagePath}\n`);

  console.log('🤖 Analyzing with Vision LLM...\n');

  const analysis = USE_ANTHROPIC
    ? await analyzeWithClaude(figmaImagePath, storybookImagePath, diffImagePath)
    : await analyzeWithGPT4V(figmaImagePath, storybookImagePath, diffImagePath);

  console.log('✅ Analysis complete!\n');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  console.log('📊 Overall Assessment:\n');
  console.log(`   ${analysis.overallAssessment}\n`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log(`🔧 Found ${analysis.differences.length} differences:\n`);

  analysis.differences.forEach((diff, index) => {
    const priorityIcon = diff.priority === 'High' ? '🔴' : diff.priority === 'Medium' ? '🟡' : '🟢';
    console.log(`${priorityIcon} [${index + 1}] ${diff.element}`);
    console.log(`   Issue: ${diff.issue}`);
    console.log(`   CSS Property: ${diff.cssProperty}`);
    console.log(`   Expected: ${diff.expectedValue}`);
    if (diff.currentValue) {
      console.log(`   Current: ${diff.currentValue}`);
    }
    console.log(`   Reasoning: ${diff.reasoning}`);
    console.log('');
  });

  if (analysis.additionalNotes) {
    console.log('═══════════════════════════════════════════════════════════════════\n');
    console.log('📝 Additional Notes:\n');
    console.log(`   ${analysis.additionalNotes}\n`);
  }

  console.log('═══════════════════════════════════════════════════════════════════\n');
  console.log('💡 Next Steps:\n');
  console.log('   1. Review the suggested fixes');
  console.log('   2. Apply high-priority fixes first');
  console.log('   3. Run validate-block again to verify\n');

  return analysis;
}

// Parse command line arguments
const args = process.argv.slice(2);
const blockNameArg = args.find(arg => arg.startsWith('--block='));
const iterationArg = args.find(arg => arg.startsWith('--iteration='));

if (!blockNameArg) {
  console.error('Usage: node scripts/analyze-diff-with-vision.js --block=<block-name> [--iteration=<number>]');
  console.error('Example: node scripts/analyze-diff-with-vision.js --block=carousel --iteration=1');
  process.exit(1);
}

const blockName = blockNameArg.split('=')[1];
const iteration = iterationArg ? parseInt(iterationArg.split('=')[1]) : 1;

analyzeDiff(blockName, iteration).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
