# Vision Analysis Prompt Template for Cursor Composer

## 🎯 Usage

1. Open Cursor Composer (Cmd+I / Ctrl+I)
2. **Select Claude model** (Claude Sonnet 4 or Claude 3.5 Sonnet)
3. Drag and drop 3 screenshot images:
   - Figma design (target)
   - Storybook implementation (current)
   - Pixel difference visualization
4. Copy and paste the prompt below

---

## 📋 Prompt Template

```
I'm providing you with 3 images comparing a Figma design with its Storybook implementation:

**Image 1**: Figma Design (Target/Ideal)
**Image 2**: Storybook Implementation (Current)
**Image 3**: Pixel Difference Visualization (Pink/Red = differences)

Please analyze the visual differences and provide actionable CSS fixes.

## Analysis Requirements

1. **Identify ALL visual differences** between Figma and Storybook
2. For each difference, provide:
   - Element name (e.g., "Carousel indicators", "Navigation buttons")
   - Issue description (e.g., "spacing too small", "color mismatch", "position offset")
   - CSS property to fix (e.g., "gap", "background-color", "top")
   - Expected value from Figma (e.g., "16px", "#e0e0e0", "50%")
   - Current value in Storybook (approximate, if visible)
   - Priority: High/Medium/Low
   - Reasoning: Why this fix is needed

## Output Format

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

## Analysis Focus Areas

- **Layout**: margins, padding, gaps, alignment
- **Typography**: font-size, line-height, letter-spacing, font-weight
- **Colors**: background-color, color, border-color
- **Sizing**: width, height, aspect-ratio
- **Spacing**: between elements, container spacing

Be precise and focus on actionable CSS fixes that can be directly applied.
```

---

## 🔄 Iterative Refinement Workflow

After receiving the analysis:

### Step 1: Review Analysis
- Check `overallAssessment` for main issues
- Prioritize `High` priority fixes
- Note `Medium` and `Low` for later iterations

### Step 2: Apply CSS Fixes

In Cursor Composer, instruct:

```
Based on the Vision analysis, apply the following CSS fixes to blocks/{block-name}/{block-name}.css:

[Copy fixes from analysis.differences, focusing on High priority first]
```

### Step 3: Re-validate

```bash
npm run validate-block -- --block={block-name} --node-id={node-id}
```

### Step 4: Repeat

Repeat Steps 1-3 with new screenshots until:
- Visual diff < 5%, OR
- Maximum 5 iterations reached

---

## 📝 Example Output

```json
{
  "overallAssessment": "The Storybook implementation has significant layout and spacing issues. The carousel is too tall, indicators are misaligned, and colors differ.",
  "differences": [
    {
      "element": "Carousel container height",
      "issue": "Container height is excessive (1590px vs ~639px expected)",
      "cssProperty": "height",
      "expectedValue": "auto",
      "currentValue": "1590px",
      "priority": "High",
      "reasoning": "The extra height creates unnecessary whitespace below the carousel"
    },
    {
      "element": "Slide indicators spacing",
      "issue": "Gap between indicators is too small",
      "cssProperty": "gap",
      "expectedValue": "16px",
      "currentValue": "8px",
      "priority": "High",
      "reasoning": "Indicators appear cramped, reducing visual clarity"
    },
    {
      "element": "Indicator color (inactive)",
      "issue": "Inactive indicator color is slightly off",
      "cssProperty": "background-color",
      "expectedValue": "#e0e0e0",
      "currentValue": "Appears darker (~#d0d0d0)",
      "priority": "Medium",
      "reasoning": "Color consistency with design system is important"
    }
  ],
  "additionalNotes": "Consider using Figma Variables for all colors to ensure consistency"
}
```

---

## 💡 Tips

1. **Start with High Priority**: Fix high-priority issues first, then re-validate
2. **Batch Similar Fixes**: Group fixes by CSS property type (layout, typography, colors)
3. **Verify After Each Iteration**: Don't apply all fixes at once; verify each batch
4. **Use Design Tokens**: When possible, use CSS Custom Properties instead of hardcoded values
5. **Document Changes**: Note which fixes were applied and why

---

## 🔗 Related Commands

```bash
# Generate screenshots for analysis
npm run validate-block -- --block={block-name} --node-id={node-id}

# Analyze with Vision LLM (alternative to Cursor Composer)
npm run analyze-diff -- --block={block-name} --iteration={N}

# Visual regression testing
npm run visual-test -- --block={block-name}
```
