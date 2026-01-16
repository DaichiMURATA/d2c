# Vision LLM Integration Guide

## Overview

The Vision LLM integration enables **human-level visual analysis** of differences between Figma designs and Storybook implementations. Instead of just counting different pixels, it can identify:

- **What** is different (e.g., "navigation buttons", "slide indicators")
- **How** it's different (e.g., "spacing too small", "color mismatch")
- **Why** it matters (e.g., "affects visual hierarchy")
- **How to fix** it (e.g., "change `gap` from 8px to 16px")

---

## Supported LLMs

### Option 1: Claude Sonnet 4 (Recommended)
- **Model**: `claude-sonnet-4-20250514`
- **Provider**: Anthropic
- **Pros**: Excellent visual analysis, detailed reasoning
- **Pricing**: ~$3 per 1M input tokens, ~$15 per 1M output tokens

### Option 2: GPT-4o
- **Model**: `gpt-4o`
- **Provider**: OpenAI
- **Pros**: Fast, widely available
- **Pricing**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens

---

## Setup

### Step 1: Get API Key

#### For Claude (Anthropic)
1. Visit https://console.anthropic.com/
2. Create account or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

#### For GPT-4V (OpenAI)
1. Visit https://platform.openai.com/
2. Create account or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 2: Set Environment Variable

#### macOS/Linux (Temporary - current session only)
```bash
# For Claude
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# For GPT-4V
export OPENAI_API_KEY="sk-your-key-here"
```

#### macOS/Linux (Permanent - add to ~/.zshrc or ~/.bashrc)
```bash
# For Claude
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key-here"' >> ~/.zshrc
source ~/.zshrc

# For GPT-4V
echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

#### Verify Setup
```bash
# For Claude
echo $ANTHROPIC_API_KEY

# For GPT-4V
echo $OPENAI_API_KEY
```

### Step 3: Choose LLM

Edit `scripts/analyze-diff-with-vision.js`:

```javascript
// Line 22
const USE_ANTHROPIC = true;  // Use Claude (Recommended)
// or
const USE_ANTHROPIC = false; // Use GPT-4V
```

---

## Usage

### Basic Usage

```bash
# Analyze the latest diff for a block
npm run analyze-diff -- --block=carousel

# Analyze a specific iteration
npm run analyze-diff -- --block=carousel --iteration=3
```

### Prerequisites

The analyze-diff command requires screenshots from a previous `validate-block` run:
- `{block}-figma-iter1.png` - Figma design screenshot
- `{block}-storybook-iter{N}.png` - Storybook implementation screenshot
- `{block}-diff-iter{N}.png` - Pixel difference visualization

### Example Workflow

```bash
# Step 1: Run visual validation (generates screenshots)
npm run validate-block -- --block=carousel --node-id=9392:121

# Step 2: Analyze differences with Vision LLM
npm run analyze-diff -- --block=carousel --iteration=1

# Step 3: Review analysis output and apply fixes
# (Manual CSS edits based on LLM suggestions)

# Step 4: Re-run validation to verify
npm run validate-block -- --block=carousel --node-id=9392:121
```

---

## Output Format

### Console Output

```
🔍 Vision LLM Diff Analyzer

   Block: carousel
   Iteration: 1
   LLM: Claude Sonnet 4

📸 Loading screenshots...
   Figma: .validation-screenshots/carousel-figma-iter1.png
   Storybook: .validation-screenshots/carousel-storybook-iter1.png
   Diff: .validation-screenshots/carousel-diff-iter1.png

🤖 Analyzing with Vision LLM...

✅ Analysis complete!

═══════════════════════════════════════════════════════════════════

📊 Overall Assessment:

   The Storybook implementation has significant layout and spacing issues.
   The carousel is too tall, indicators are misaligned, and colors differ.

═══════════════════════════════════════════════════════════════════

🔧 Found 5 differences:

🔴 [1] Carousel container height
   Issue: Container height is excessive (1590px vs ~639px expected)
   CSS Property: height
   Expected: auto (fit content)
   Current: 1590px
   Reasoning: The extra height creates unnecessary whitespace below the carousel

🔴 [2] Slide indicators spacing
   Issue: Gap between indicators is too small
   CSS Property: gap
   Expected: 16px
   Current: 8px
   Reasoning: Indicators appear cramped, reducing visual clarity

🟡 [3] Indicator color (inactive)
   Issue: Inactive indicator color is slightly off
   CSS Property: background-color
   Expected: #e0e0e0
   Current: Appears darker (~#d0d0d0)
   Reasoning: Color consistency with design system is important

...
```

### JSON Structure

The analysis is also available as structured JSON:

```json
{
  "overallAssessment": "Brief summary of main issues",
  "differences": [
    {
      "element": "Carousel container height",
      "issue": "Container height is excessive",
      "cssProperty": "height",
      "expectedValue": "auto",
      "currentValue": "1590px",
      "priority": "High",
      "reasoning": "Creates unnecessary whitespace"
    }
  ],
  "additionalNotes": "Consider using Figma Variables for all colors"
}
```

---

## Integration with Automated Validation

### Automated Fix Loop (Future Enhancement)

```javascript
// In compare-figma-storybook.js
if (diffPercentage > 10) {
  // Call Vision LLM analysis
  const analysis = await analyzeWithVisionLLM(figmaPath, storybookPath, diffPath);
  
  // Apply suggested fixes
  for (const fix of analysis.differences.filter(d => d.priority === 'High')) {
    await applyCSSFix(blockName, fix.cssProperty, fix.expectedValue);
  }
}
```

---

## Cost Estimation

### Per Analysis
- **Input**: ~3 images × 2MB each = ~6MB
- **Output**: ~1000 tokens (JSON response)
- **Cost (Claude)**: ~$0.02 per analysis
- **Cost (GPT-4V)**: ~$0.015 per analysis

### Per Block Generation (10 iterations)
- **Total Cost**: ~$0.20 (Claude) or ~$0.15 (GPT-4V)

### Monthly (100 blocks)
- **Total Cost**: ~$20 (Claude) or ~$15 (GPT-4V)

---

## Best Practices

### 1. Run After Initial Generation
- Generate block code first (CSS, JS, Stories)
- Run visual validation
- Use Vision LLM to identify remaining issues
- Apply fixes manually or semi-automatically

### 2. Focus on High-Priority Fixes First
- Vision LLM categorizes issues by priority
- Fix High → Medium → Low
- Re-run validation after each batch

### 3. Combine with Figma Styles API
- Use Figma Styles Extractor first (extract-figma-styles)
- Use Vision LLM to catch edge cases
- Vision LLM is great for layout, spacing, visual alignment

### 4. Iterative Refinement
- Run Vision LLM analysis multiple times
- Each iteration should show fewer differences
- Stop when diff < 5%

---

## Troubleshooting

### Error: API Key not set
```bash
# Check if key is set
echo $ANTHROPIC_API_KEY  # or OPENAI_API_KEY

# Set temporarily
export ANTHROPIC_API_KEY="sk-ant-..."

# Set permanently (add to ~/.zshrc)
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

### Error: Screenshots not found
```bash
# Run validate-block first
npm run validate-block -- --block=carousel --node-id=9392:121

# Then run analyze-diff
npm run analyze-diff -- --block=carousel
```

### Error: Could not extract JSON
- Check LLM response in console
- Verify API key is valid
- Try switching to alternative LLM (Claude ↔ GPT-4V)

### Error: API rate limit
- Wait a few seconds and retry
- Consider batching analyses
- Check API usage dashboard

---

## Future Enhancements

- [ ] Automatic CSS fix application from Vision LLM suggestions
- [ ] Multi-variant analysis (compare all 6 carousel variants at once)
- [ ] Historical tracking (track improvement over iterations)
- [ ] Confidence scores for each suggestion
- [ ] Integration with Chromatic PR comments
- [ ] Batch analysis mode (analyze all blocks in project)

---

## Examples

### Example 1: Carousel Block

**Command**:
```bash
npm run analyze-diff -- --block=carousel --iteration=1
```

**Analysis**:
- Container height issue (High priority)
- Indicator spacing (High priority)
- Navigation button position (Medium priority)
- Color variations (Low priority)

**Result**: 4 actionable CSS fixes, reduced diff from 74% to 12%

### Example 2: Hero Block

**Command**:
```bash
npm run analyze-diff -- --block=hero --iteration=1
```

**Analysis**:
- Heading font size mismatch (High priority)
- Image aspect ratio incorrect (High priority)
- Button alignment off-center (Medium priority)

**Result**: 3 actionable CSS fixes, reduced diff from 82% to 8%

---

## Comparison with Existing Tools

| Approach | Pros | Cons |
|----------|------|------|
| **Pixel Diff (pixelmatch)** | Fast, deterministic | Only shows "what" differs, not "why" |
| **Figma Styles API** | Precise values | Misses layout/spacing issues |
| **Vision LLM** ✨ | Human-level understanding | Slower, requires API key |
| **Chromatic** | Built-in VR | No automated fix suggestions |

**Best Strategy**: Combine all 3 approaches:
1. Figma Styles API → Extract precise values
2. Pixel Diff → Measure overall accuracy
3. Vision LLM → Identify remaining visual issues

---

## License & Attribution

This feature uses:
- **Anthropic Claude API** (https://anthropic.com)
- **OpenAI GPT-4V API** (https://openai.com)

Please review their respective Terms of Service and Pricing.
