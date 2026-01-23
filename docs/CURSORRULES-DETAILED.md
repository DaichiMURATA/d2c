# Detailed Block Generation Guidelines (Reference)

このドキュメントは`.cursorrules`の詳細版です。通常の開発では`.cursorrules`の簡潔版で十分ですが、詳細な仕様が必要な場合はこちらを参照してください。

---

## 🔍 Understanding Figma API: Available Information and Limitations

### Critical Premise

**Figma API provides "design data", NOT "HTML code".**

Figma → HTML/CSS conversion is a process of "interpreting" and "generating" data. Complete automatic conversion is impossible; certain inference and supplementation logic is required.

---

### ✅ Information Available from Figma API

#### 1. Node Structure (Hierarchy)

**Available**:
```json
{
  "type": "COMPONENT_SET",
  "name": "Carousel",
  "id": "9392:122",
  "children": [
    {
      "type": "COMPONENT",
      "name": "isSingle=false, contentPosition=center",
      "id": "9392:121",
      "children": [
        { "type": "RECTANGLE", "name": "Background" },
        { "type": "TEXT", "name": "Title" }
      ]
    }
  ]
}
```

**Usage**:
- Understand component structure
- Identify text/image/layout elements
- Determine nesting relationships

**Limitation**:
- ❌ Does NOT provide HTML tag names
- ❌ Does NOT provide CSS class names
- → Requires interpretation and mapping

---

#### 2. Style Information

**Available**:
```json
{
  "fills": [{ "type": "SOLID", "color": { "r": 0.1, "g": 0.2, "b": 0.3 } }],
  "strokes": [...],
  "effects": [{ "type": "DROP_SHADOW", ... }],
  "fontSize": 16,
  "fontFamily": "Noto Sans JP",
  "fontWeight": 700
}
```

**Usage**:
- Extract color, typography, spacing
- Map to CSS properties

**Limitation**:
- ❌ Transparency/overlay colors are NOT always explicit
- ❌ Complex gradients may not be fully described
- → Vision AI analysis helps fill these gaps

---

#### 3. Layout Information

**Available**:
```json
{
  "layoutMode": "VERTICAL",
  "primaryAxisSizingMode": "AUTO",
  "counterAxisSizingMode": "FIXED",
  "itemSpacing": 16,
  "paddingLeft": 24,
  "paddingTop": 16
}
```

**Usage**:
- Determine flexbox/grid layout
- Extract spacing values

**Limitation**:
- ❌ Does NOT provide exact CSS syntax
- ❌ Does NOT handle responsive breakpoints
- → Requires interpretation based on design patterns

---

#### 4. Design Tokens (Variables)

**Available**:
```json
{
  "boundVariables": {
    "fills": [{ "id": "VariableID:123", "name": "color/primary" }]
  }
}
```

**Usage**:
- Map Figma variables to CSS custom properties
- Maintain design system consistency

**Best Practice**:
- **Priority**: boundVariables > existing tokens > literal values

---

### ❌ Information NOT Available from Figma API

#### 1. Semantic HTML Structure

**NOT Available**:
- Which elements should be `<button>` vs `<a>`
- Whether to use `<section>` vs `<div>`
- ARIA attributes for accessibility

**Solution**:
- Follow EDS conventions
- Reference `config/component/component-definition.json`
- Apply semantic HTML best practices

---

#### 2. Interactive Behavior

**NOT Available**:
- Click handlers
- Carousel slide logic
- Form validation

**Solution**:
- Implement standard EDS block patterns
- Reference existing block implementations (as patterns, not copy-paste)

---

#### 3. Visual Details (Transparency, Overlays)

**NOT Available** (or incomplete):
- Exact RGBA values for semi-transparent overlays
- Visual positioning of overlapping elements
- Subtle shadows and effects

**Solution**:
- **Vision AI Analysis**: Read actual Figma screenshots
- Extract visual details by analyzing the image
- Document with `/* 画像から検出 */` comments

---

## 🎨 Vision AI Enhanced Generation

### Why Vision AI?

**Problem**: Figma API alone gives **50-60% visual fidelity**

Traditional flow:
```
Figma API → CSS Generation → Storybook
(Missing: transparency, exact colors, visual positioning)
```

**Solution**: Add Vision AI to analyze screenshots → **85-90% visual fidelity**

Enhanced flow:
```
Figma API + Screenshot Analysis → CSS Generation → Storybook
(Includes: RGBA values, exact positioning, visual details)
```

---

### Vision AI Workflow Details

#### What to Extract from Screenshots

1. **Colors**
   - Background overlay RGBA (estimate transparency)
   - Text colors (exact hex/rgb)
   - Button/icon colors

2. **Positioning**
   - Text alignment (center/left/right)
   - Vertical positioning (top/center/bottom)
   - Absolute vs relative positioning

3. **Sizes**
   - Padding/margin (px)
   - Element dimensions
   - Icon sizes

4. **Visual Effects**
   - Shadows (estimate blur/spread)
   - Border radius
   - Opacity levels

---

#### How to Document Visual Analysis

**In CSS Comments**:
```css
.carousel {
  /* 画像から検出: 背景オーバーレイ */
  background: rgba(0, 0, 0, 0.6);
  
  /* 画像から検出: テキスト中央揃え */
  text-align: center;
  
  /* 画像から検出: 垂直中央配置 */
  align-items: center;
}
```

**Why Document**:
- Clarity for future developers
- Validation for Vision AI accuracy
- Easy to adjust if wrong

---

## 📖 Step-by-Step Alternative Workflow

If you need manual control over each step (instead of one-shot generation):

### Step 1: Capture Screenshot
```bash
npm run capture-figma-variant -- --block=carousel --node-id=9392:121
```
**Output**: `blocks/carousel/figma-variant-9392-121.png`

### Step 2: Analyze Screenshot
- Open screenshot in Cursor Composer (Cmd+I)
- Prompt: "このスクリーンショットから視覚的詳細を抽出してください"
- Extract: colors, positioning, sizes, effects

### Step 3: Generate CSS
- Apply extracted details to CSS
- Add `/* 画像から検出 */` comments
- Use design tokens where available

### Step 4: Generate JS
- Follow EDS structure
- Reference `config/component/component-definition.json`
- Implement block functionality

### Step 5: Generate Stories
- One story per variant
- Import Figma image assets
- Add Figma URLs to `parameters.design`

### Step 6: Validate
```bash
npm run validate-block -- --block=carousel
```
- Check visual diff %
- Iterate if needed

---

## 🛠️ Tools and Scripts

### Screenshot Capture
```bash
npm run capture-figma-variant -- --block={blockName} --node-id={nodeId}
```
- Captures high-res Figma variant screenshot
- Saves to `blocks/{blockName}/figma-variant-{nodeId}.png`

### Asset Download
```bash
node scripts/download-figma-assets.js --block={blockName} --node-id={nodeId}
```
- Downloads image assets from Figma
- Saves to `blocks/{blockName}/{blockName}-background.png`

### Validation
```bash
npm run validate-block -- --block={blockName}
```
- Captures Storybook screenshots
- Compares with Figma screenshots
- Generates HTML report with diff %

### Figma Component Discovery
```bash
node scripts/discover-figma-components.js
```
- Discovers all Figma components and variants
- Updates `config/figma/figma-urls.json`

---

## 📋 Best Practices

### 1. Design Token Usage
- Use CSS custom properties from `design-tokens.css`
- Priority: boundVariables > existing tokens > literal values
- Document when using literal values

### 2. EDS HTML Structure
- Always follow Block > Rows > Cells pattern
- Add `data-block-name` and `data-block-status` attributes
- Use semantic HTML

### 3. Accessibility
- Include ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### 4. Performance
- Lazy load images
- Use WebP with JPEG fallback
- Minimize JavaScript

### 5. Responsive Design
- Follow Figma responsive tokens
- Test on mobile/tablet/desktop
- Use CSS Grid/Flexbox

---

## 🔧 Troubleshooting

### AI Ignores Workflow
- Check if `.cursorrules` is being read (should be automatic)
- Simplify prompt: just "{BlockName}ブロックを生成してください"
- Add explicit trigger: "ワークフローに従ってください"

### Visual Diff Too High (>20%)
- Re-analyze screenshot with Vision AI
- Check for missing RGBA values
- Verify positioning (center/left/right)
- Compare with Figma side-by-side

### Missing Figma Node IDs
- Run `node scripts/discover-figma-components.js`
- Manually update `config/figma/figma-urls.json`
- Verify node IDs in Figma URL

---

## 📚 Related Documentation

- `.cursorrules` - Simplified workflow (read this first)
- `docs/VISION-AI-ENHANCED-GENERATION.md` - Vision AI technical details
- `docs/VISUAL-VALIDATION-WORKFLOW.md` - Validation process
- `prompts/vision-*.md` - Prompt templates
- `config/figma/figma-urls.json` - Figma variant mapping
- `config/component/component-definition.json` - EDS component definitions

---

This document provides comprehensive details for complex scenarios. For day-to-day development, the simplified `.cursorrules` should be sufficient.
