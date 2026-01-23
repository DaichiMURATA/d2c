# Vision AI Enhanced Block Generation

**目的**: Figma Variantのスクリーンショットを初期生成時に解析し、視覚的な詳細（色、配置、透明度、形状など）を正確に反映したHTML/CSSを生成する。

---

## 🎯 課題と解決策

### 現在の問題

**従来の生成フロー**:
```
Figma構造情報 → HTML/CSS生成 → Storybook → 視覚的な差異が大きい
```

**問題点**:
1. Figma APIから取得できるのは構造とトークン情報のみ
2. **視覚的な詳細**（透明度、重なり、実際の見た目）が反映されない
3. 例：Carouselの黒い透過背景、白文字、中央配置などが推測できない

### 新しいアプローチ

**Vision AI統合フロー**:
```
Figma構造情報 + Figmaスクリーンショット → Vision AI解析 → 
視覚的詳細を含むHTML/CSS生成 → Storybook → 高精度な初期実装
```

**改善点**:
1. ✅ スクリーンショットから視覚的な詳細を抽出
2. ✅ 背景色、透明度、テキスト色、配置などを正確に把握
3. ✅ 初期生成時に高精度なCSSを適用

---

## 🔄 新しい生成フロー

### Phase 1: Figma情報収集（拡張）

```bash
# 1. Figma構造とトークン情報の抽出（既存）
npm run extract-figma-styles -- --block=carousel --node-id=9392:121

# 2. ⭐ NEW: Figmaスクリーンショット取得
npm run capture-figma-variant -- --block=carousel --node-id=9392:121
```

**出力**:
- `blocks/carousel/figma-styles.json` （既存）
- `blocks/carousel/figma-variant-9392-121.png` （新規）

---

### Phase 2: Vision AI解析（新規）

```bash
# 3. Vision AIで視覚的詳細を解析
npm run analyze-variant-screenshot -- --block=carousel --node-id=9392:121
```

**Vision AIに渡す情報**:
1. Figmaスクリーンショット
2. Figma構造情報（`figma-styles.json`）
3. 解析プロンプト（視覚的詳細の抽出）

**Vision AIの解析項目**:

#### 背景・レイヤー
- 背景色（solid/gradient/image）
- 透明度（rgba、opacity）
- 重なり順序（z-index相当）

#### テキスト
- 文字色
- 配置（左右、上下）
- シャドウ・アウトライン
- 背景との対比（明度）

#### 形状・境界
- Border radius（角丸）
- Border color/width
- Shadow（box-shadow、text-shadow）
- 形状（正方形、長方形、円形）

#### レイアウト
- 要素の配置（絶対位置 vs フロー）
- 中央配置、左右配置
- Padding、Margin（視覚的な余白）
- グリッド配置

#### インタラクティブ要素
- ボタン・矢印の形状
- ホバー状態の推測
- アイコンのスタイル

**出力**:
- `blocks/carousel/vision-analysis.json`

```json
{
  "component": "carousel",
  "variantId": "9392:121",
  "visualDetails": {
    "overlayPanel": {
      "backgroundColor": "rgba(0, 0, 0, 0.6)",
      "textColor": "#ffffff",
      "position": "center",
      "alignment": {
        "horizontal": "center",
        "vertical": "center"
      },
      "padding": {
        "top": "40px",
        "right": "60px",
        "bottom": "40px",
        "left": "60px"
      },
      "borderRadius": "0px",
      "boxShadow": "none"
    },
    "navigationArrows": {
      "backgroundColor": "rgba(0, 0, 0, 0.5)",
      "iconColor": "#ffffff",
      "shape": "rounded-square",
      "borderRadius": "8px",
      "size": "48px",
      "position": "sides-center"
    },
    "carouselIndicators": {
      "activeColor": "#ffffff",
      "inactiveColor": "rgba(255, 255, 255, 0.5)",
      "size": "12px",
      "spacing": "8px",
      "position": "bottom-center"
    }
  }
}
```

---

### Phase 3: CSS生成（拡張）

```bash
# 4. Figma構造 + Vision解析 → CSS生成
npm run generate-css -- --block=carousel --node-id=9392:121
```

**生成ロジック（拡張）**:

```javascript
// 従来: Figma構造のみ
const cssFromStructure = generateCSSFromStructure(figmaStyles);

// 新規: Vision解析結果をマージ
const visionDetails = loadVisionAnalysis(blockName, nodeId);
const enhancedCSS = mergeCSSWithVisionDetails(cssFromStructure, visionDetails);

// 出力
writeCSSFile(blockName, enhancedCSS);
```

**生成例（Carousel）**:

```css
/* 従来の生成（構造のみ） */
.carousel {
  display: flex;
  /* ... */
}

.carousel-slide {
  position: relative;
}

/* ⭐ Vision AIによる拡張 */
.carousel-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Vision AIが検出 */
  z-index: 1;
}

.carousel-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Vision AIが中央配置を検出 */
  color: #ffffff; /* Vision AIが白文字を検出 */
  text-align: center;
  padding: 40px 60px; /* Vision AIが余白を検出 */
  z-index: 2;
}

.carousel-navigation button {
  background-color: rgba(0, 0, 0, 0.5); /* Vision AIが検出 */
  color: #ffffff;
  border-radius: 8px; /* Vision AIが角丸を検出 */
  width: 48px;
  height: 48px;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5); /* Vision AIが検出 */
}

.carousel-indicators button.active {
  background-color: #ffffff; /* Vision AIが検出 */
}
```

---

### Phase 4: HTML生成（拡張）

```bash
# 5. Figma構造 + Vision解析 → HTML生成
npm run generate-html -- --block=carousel --node-id=9392:121
```

**生成ロジック（拡張）**:

Vision解析結果から、必要なHTML要素を推測：

```javascript
// Vision AIが「黒い透過オーバーレイ」を検出
// → ::before疑似要素 or 専用のdiv要素を生成

if (visionDetails.overlayPanel.backgroundColor.includes('rgba')) {
  // オーバーレイ用の要素を追加
  htmlStructure.addOverlayElement();
}

// Vision AIが「中央配置のコンテンツ」を検出
// → 絶対位置 + transform を適用
if (visionDetails.overlayPanel.position === 'center') {
  htmlStructure.contentPosition = 'absolute-center';
}
```

---

## 📋 実装ステップ

### Step 1: Figmaスクリーンショット取得スクリプト

**新規ファイル**: `scripts/capture-figma-variant.js`

```javascript
import { writeFileSync } from 'fs';
import { join } from 'path';

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_TOKEN = process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

async function captureFigmaVariant(blockName, nodeId) {
  console.log('📸 Capturing Figma Variant Screenshot\n');
  
  // Fetch screenshot from Figma
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${FIGMA_FILE_ID}?ids=${nodeId}&format=png&scale=2`,
    { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
  );
  
  const data = await response.json();
  const imageUrl = data.images[nodeId];
  
  // Download image
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Save to block directory
  const outputPath = join(__dirname, '..', 'blocks', blockName, `figma-variant-${nodeId.replace(':', '-')}.png`);
  writeFileSync(outputPath, buffer);
  
  console.log(`✅ Screenshot saved: ${outputPath}\n`);
  return outputPath;
}

export default captureFigmaVariant;
```

---

### Step 2: Vision AI解析スクリプト

**新規ファイル**: `scripts/analyze-variant-screenshot.js`

```javascript
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const VISION_ANALYSIS_PROMPT = `
あなたはUI/UXエキスパートです。Figmaデザインのスクリーンショットを解析し、視覚的な詳細を抽出してください。

# 解析項目

## 1. 背景・レイヤー
- 背景色（カラーコード、透明度）
- 背景画像の有無
- オーバーレイの有無と透明度

## 2. テキスト
- 文字色（カラーコード）
- 配置（left/center/right、top/center/bottom）
- シャドウやアウトライン

## 3. 形状・境界
- Border radius（数値px）
- Border color/width
- Box shadow

## 4. レイアウト
- 要素の配置方法（絶対位置/相対位置）
- 中央配置の有無
- Padding、Margin（視覚的な余白をpxで推定）

## 5. インタラクティブ要素
- ボタン・矢印の形状（正方形/円形/角丸）
- サイズ（px）
- 色と透明度

# 出力形式

JSON形式で出力してください。数値は必ず単位（px、%など）付きで返してください。

{
  "visualDetails": {
    "background": { ... },
    "text": { ... },
    "shapes": { ... },
    "layout": { ... },
    "interactive": { ... }
  }
}
`;

async function analyzeVariantScreenshot(blockName, nodeId, screenshotPath, figmaStylesPath) {
  console.log('🔍 Analyzing Figma Variant with Vision AI\n');
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  // Load screenshot
  const screenshotBase64 = readFileSync(screenshotPath, { encoding: 'base64' });
  
  // Load Figma structure (for context)
  const figmaStyles = JSON.parse(readFileSync(figmaStylesPath, 'utf-8'));
  
  // Prepare prompt with structure context
  const contextPrompt = `
${VISION_ANALYSIS_PROMPT}

# Figma構造情報（参考）
Component: ${figmaStyles.nodeName}
Type: ${figmaStyles.nodeType}
Size: ${figmaStyles.styles.sizing?.width}x${figmaStyles.styles.sizing?.height}

このコンテキストを参考に、スクリーンショットから視覚的詳細を抽出してください。
`;
  
  // Call Vision API
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: screenshotBase64,
          },
        },
        {
          type: 'text',
          text: contextPrompt,
        },
      ],
    }],
  });
  
  // Parse response
  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Vision AI did not return valid JSON');
  }
  
  const visionAnalysis = JSON.parse(jsonMatch[0]);
  
  // Save to file
  const outputPath = join(__dirname, '..', 'blocks', blockName, `vision-analysis-${nodeId.replace(':', '-')}.json`);
  writeFileSync(outputPath, JSON.stringify(visionAnalysis, null, 2));
  
  console.log(`✅ Vision analysis saved: ${outputPath}\n`);
  return visionAnalysis;
}

export default analyzeVariantScreenshot;
```

---

### Step 3: CSS生成ロジックの拡張

**既存ファイル拡張**: `scripts/generate-css.js`（新規作成）

```javascript
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Figma構造からベースCSSを生成（既存ロジック）
 */
function generateCSSFromStructure(figmaStyles) {
  let css = '';
  
  // Layout
  if (figmaStyles.styles.layout) {
    const layout = figmaStyles.styles.layout;
    if (layout.display) css += `  display: ${layout.display};\n`;
    if (layout.flexDirection) css += `  flex-direction: ${layout.flexDirection};\n`;
    if (layout.gap) css += `  gap: ${layout.gap};\n`;
  }
  
  // Sizing
  if (figmaStyles.styles.sizing) {
    const { width, height } = figmaStyles.styles.sizing;
    css += `  width: ${width}px;\n`;
    css += `  height: ${height}px;\n`;
  }
  
  // Spacing
  if (figmaStyles.styles.spacing) {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = figmaStyles.styles.spacing;
    css += `  padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;\n`;
  }
  
  return css;
}

/**
 * ⭐ NEW: Vision解析結果をCSSにマージ
 */
function mergeCSSWithVisionDetails(baseCSS, visionDetails) {
  let enhancedCSS = baseCSS;
  
  const details = visionDetails.visualDetails;
  
  // Background (Vision AIが透明度を検出)
  if (details.background?.backgroundColor) {
    enhancedCSS += `  background-color: ${details.background.backgroundColor};\n`;
  }
  
  // Text color
  if (details.text?.color) {
    enhancedCSS += `  color: ${details.text.color};\n`;
  }
  
  // Text alignment (Vision AIが配置を検出)
  if (details.text?.horizontalAlignment) {
    enhancedCSS += `  text-align: ${details.text.horizontalAlignment};\n`;
  }
  
  // Border radius (Vision AIが角丸を検出)
  if (details.shapes?.borderRadius) {
    enhancedCSS += `  border-radius: ${details.shapes.borderRadius};\n`;
  }
  
  // Box shadow
  if (details.shapes?.boxShadow) {
    enhancedCSS += `  box-shadow: ${details.shapes.boxShadow};\n`;
  }
  
  // Position (Vision AIが中央配置を検出)
  if (details.layout?.position === 'absolute-center') {
    enhancedCSS += `  position: absolute;\n`;
    enhancedCSS += `  top: 50%;\n`;
    enhancedCSS += `  left: 50%;\n`;
    enhancedCSS += `  transform: translate(-50%, -50%);\n`;
  }
  
  return enhancedCSS;
}

/**
 * メイン生成関数
 */
async function generateCSS(blockName, nodeId) {
  console.log('🎨 Generating CSS with Vision AI Enhancement\n');
  
  // Load Figma structure
  const figmaStylesPath = join(__dirname, '..', 'blocks', blockName, 'figma-styles.json');
  const figmaStyles = JSON.parse(readFileSync(figmaStylesPath, 'utf-8'));
  
  // Load Vision analysis
  const visionAnalysisPath = join(__dirname, '..', 'blocks', blockName, `vision-analysis-${nodeId.replace(':', '-')}.json`);
  const visionAnalysis = JSON.parse(readFileSync(visionAnalysisPath, 'utf-8'));
  
  // Generate base CSS from structure
  const baseCSS = generateCSSFromStructure(figmaStyles);
  
  // Merge with Vision details
  const enhancedCSS = mergeCSSWithVisionDetails(baseCSS, visionAnalysis);
  
  // Generate full CSS file
  const fullCSS = `.${blockName} {\n${enhancedCSS}}\n`;
  
  // Save
  const outputPath = join(__dirname, '..', 'blocks', blockName, `${blockName}.css`);
  writeFileSync(outputPath, fullCSS);
  
  console.log(`✅ Enhanced CSS generated: ${outputPath}\n`);
}

export default generateCSS;
```

---

## 🚀 使用方法

### 統合コマンド（推奨）

```bash
# 1つのコマンドで全フェーズを実行
npm run generate-block-with-vision -- --block=carousel --node-id=9392:121
```

**内部処理**:
1. Figma構造抽出
2. Figmaスクリーンショット取得
3. Vision AI解析
4. CSS生成（Vision統合）
5. HTML生成（Vision統合）
6. Storybook Story生成

### 段階的実行

```bash
# Phase 1: Figma情報収集
npm run extract-figma-styles -- --block=carousel --node-id=9392:121
npm run capture-figma-variant -- --block=carousel --node-id=9392:121

# Phase 2: Vision AI解析
npm run analyze-variant-screenshot -- --block=carousel --node-id=9392:121

# Phase 3: 生成
npm run generate-css -- --block=carousel --node-id=9392:121
npm run generate-stories -- --block=carousel
```

---

## 📊 期待される改善効果

### Before（従来の生成）

```css
.carousel-slide {
  position: relative;
}

.carousel h2 {
  font-size: 48px;
}
```

**結果**: 背景透明度、テキスト色、配置が一致せず、差異 **60%**

### After（Vision AI統合）

```css
.carousel-slide {
  position: relative;
  background: rgba(0, 0, 0, 0.6); /* Vision AIが検出 */
}

.carousel h2 {
  font-size: 48px;
  color: #ffffff; /* Vision AIが検出 */
  text-align: center; /* Vision AIが検出 */
}

.carousel-navigation button {
  background: rgba(0, 0, 0, 0.5); /* Vision AIが検出 */
  border-radius: 8px; /* Vision AIが検出 */
}
```

**結果**: 視覚的詳細が初期生成に反映され、差異 **10-15%** に改善

---

## 🔄 .cursorrules への統合

`.cursorrules` に以下のセクションを追加：

```markdown
### Vision AI Enhanced Generation

When generating a new block from Figma:

1. **Extract Figma structure** (existing)
   ```bash
   npm run extract-figma-styles -- --block={block} --node-id={nodeId}
   ```

2. **⭐ Capture Figma screenshot** (new)
   ```bash
   npm run capture-figma-variant -- --block={block} --node-id={nodeId}
   ```

3. **⭐ Analyze with Vision AI** (new)
   ```bash
   npm run analyze-variant-screenshot -- --block={block} --node-id={nodeId}
   ```

4. **Generate CSS with Vision details** (enhanced)
   ```bash
   npm run generate-css -- --block={block} --node-id={nodeId}
   ```

5. **Generate HTML with Vision details** (enhanced)
   ```bash
   npm run generate-html -- --block={block} --node-id={nodeId}
   ```

6. **Validate visual accuracy**
   ```bash
   npm run validate-block -- --block={block}
   ```

**Expected improvement**: Initial visual diff reduced from 50-60% to 10-15%.
```

---

## 💡 将来的な拡張

### 1. 複数Variant一括処理

```bash
npm run generate-all-variants-with-vision -- --block=carousel
```

### 2. Vision解析結果のキャッシュ

同じVariantを再生成する際、Vision解析をスキップ

### 3. 差分修正にもVision活用

初期生成だけでなく、検証後の差分修正にもVision解析を活用

---

## 🎯 成功基準

- ✅ 初期生成時の視覚的差異が **50% → 15%以下** に改善
- ✅ 背景色、透明度、テキスト色が正確に反映
- ✅ レイアウト（中央配置など）が正確に反映
- ✅ インタラクティブ要素（ボタン、矢印）のスタイルが正確
