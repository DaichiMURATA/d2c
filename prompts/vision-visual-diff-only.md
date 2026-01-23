# Vision Analysis Prompt - Visual Differences Only

## 🎯 Purpose

Analyze visual differences between Figma design and Storybook implementation WITHOUT proposing CSS fixes.

## 📋 Prompt Template

```
I'm providing you with 2 images comparing a Figma design with its Storybook implementation:

**Image 1**: Figma Design (Target/Ideal)
**Image 2**: Storybook Implementation (Current)

Current difference: [X]%

## Your Task

Compare these two images side-by-side and describe ONLY the VISUAL differences you observe. 
DO NOT propose CSS fixes or property changes.

**IMPORTANT**: Look very carefully at subtle differences. Even if the images appear similar at first glance, examine:

### Critical Areas to Check:

1. **Text/Heading Position**
   - Measure the distance from the top edge to the text
   - Measure the distance from the left edge to the text
   - Are they aligned exactly the same?

2. **Text/Heading Appearance**
   - Compare font sizes (pixel height of characters)
   - Compare font weights (thickness/boldness)
   - Compare line heights (vertical spacing)
   - Compare letter spacing

3. **Background Image**
   - Note any shifts in position (even small ones)
   - Compare the alignment of patterns or key features

4. **Spacing & Layout**
   - Measure gaps and margins around elements
   - Compare container heights and widths

**Be precise**: If you see a difference, measure it approximately in pixels.
**Be thorough**: Even 5-10px differences are significant.

Focus on:
1. **Position differences** (e.g., "Text is 10px lower", "Image shifted 20px right")
2. **Size differences** (e.g., "Text appears 4px larger", "Container is 40px taller")
3. **Spacing differences** (e.g., "8px more space on left", "Gap between elements is smaller")
4. **Color differences** (e.g., "Background is lighter", "Text color is slightly darker")
5. **Alignment differences** (e.g., "Text is left-aligned instead of centered")

## Output Format

Return your analysis as JSON:

```json
{
  "overallAssessment": "Brief summary of what differs visually",
  "visualDifferences": [
    {
      "location": "Where in the design (e.g., 'Top left area', 'Heading', 'Background image')",
      "observation": "What you see (e.g., 'Text starts 15px lower than Figma')",
      "measurement": "Approximate measurement if visible (e.g., '~15px', '~10%')",
      "priority": "High|Medium|Low",
      "reasoning": "Why this difference is significant"
    }
  ],
  "affectedAreas": ["List of UI areas with visible differences"]
}
```

## Important Rules

- ✅ DO: Describe what you SEE (position, size, spacing, color)
- ❌ DON'T: Mention CSS properties, selectors, or code changes
- ✅ DO: Provide measurements in pixels when possible
- ❌ DON'T: Assume HTML structure or element types
- ✅ DO: Focus on observable visual differences
- ❌ DON'T: Propose solutions or fixes

## Example Good Observations

✅ "The heading text starts approximately 24px lower than in Figma"
✅ "The right side of the background image appears shifted upward by about 40px"
✅ "There is approximately 8px more horizontal spacing on the left side"
✅ "The text appears about 4-5px larger in height"

## Example Bad Observations (Too Technical)

❌ "padding-top should be 40px instead of 64px"
❌ "Change .hero h1 font-size to 44px"
❌ "Use background-position: center bottom"

Remember: You are describing WHAT you see, not HOW to fix it.
```

---

## 🔄 Two-Step Workflow

### Step 1: Visual Analysis (Vision AI)

1. Open Cursor Composer (Cmd+I)
2. Select Claude model
3. **Drag 2 screenshots only:**
   - `hero-figma-iter1.png`
   - `hero-storybook-iter1.png`
   - ❌ **Do NOT include** `hero-diff-iter1.png` (causes confusion)
4. Use the prompt above
5. Receive: Pure visual observations

### Step 2: CSS Fix Proposal (AI with HTML/CSS context)

1. In Cursor Composer (same or new session)
2. Provide context:
   ```
   @blocks/hero/hero.js
   @blocks/hero/hero.css
   @blocks/hero/hero.stories.js
   ```
3. Provide Vision analysis results
4. Ask:
   ```
   Based on these visual differences and the actual HTML structure,
   what CSS changes should be made to hero.css to match Figma?
   ```

---

## Benefits

1. **Vision AI stays in its lane**: Image analysis only
2. **HTML-aware AI makes decisions**: With full context
3. **More accurate fixes**: Based on actual DOM structure
4. **Better reasoning**: Can explain why specific properties need changes
5. **Avoids guesswork**: No assumptions about HTML

---

## Example Complete Workflow

### Input to Vision AI
- 2 screenshots (Figma + Storybook only)
- "Describe visual differences only"

### Output from Vision AI
```json
{
  "visualDifferences": [
    {
      "location": "Heading text in upper left",
      "observation": "Text starts approximately 24px lower than Figma",
      "measurement": "~24px",
      "priority": "High"
    }
  ]
}
```

### Input to Context-Aware AI
```
@blocks/hero/hero.css
@blocks/hero/hero.js

Vision analysis found: "Heading text starts 24px lower than Figma"

Looking at the HTML structure and current CSS, what property should be changed?
```

### Output from Context-Aware AI
```
Looking at hero.js, the heading is rendered as:
  <h1>Heading in Block</h1>

In hero.css, I see:
  .hero { padding: 40px 24px; }
  .hero h1 { padding-bottom: 24px; }

To move the heading 24px UP, we should reduce .hero's padding-top from 40px to 16px.

Alternatively, if we want to maintain the 40px container padding and move just
the heading up, we could add:
  .hero h1 { margin-top: -24px; }

Recommendation: Reduce .hero padding-top to 16px (cleaner solution).
```
