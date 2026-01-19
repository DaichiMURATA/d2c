# Figma-Storybook Design QA Automation

**完全自動化されたFigmaとStorybookの視覚的一致検証 + 自動修正フロー**

---

## 🎯 目的

**Figmaのデザイン（正解）**と**Storybookの実装（現状）**を自動比較し、差異を検出・修正するシステムです。

### これは何？

| 種類 | 比較対象 | 目的 |
|-----|---------|------|
| **Design QA** ← これ | **Figma** vs **Storybook** | デザインと実装の一致を検証 |
| Visual Regression | Storybook（過去）vs Storybook（現在）| 実装の劣化を検知 |

---

## 🌟 特徴

### 1. 完全自動化フロー
```
Figmaスクリーンショット取得
  ↓
Storybookスクリーンショット取得
  ↓
ピクセル単位で比較
  ↓
差異を検出
  ↓
CSS自動修正
  ↓
Hot Reload待機
  ↓
再度比較（最大5回ループ）
  ↓
HTMLレポート生成
```

### 2. Chromatic風のHTMLレポート

**視覚的でわかりやすい**:
- 📊 サマリー（差分パーセンテージ、ステータス）
- 🎨 3画面比較（Figma / Storybook / Diff）
- 💡 修正提案リスト
- 🔗 Figma/Storybookへの直リンク

**従来のChromatic**:
- クラウドで実行
- スクリーンショットが外部に送信される
- 有料（$149/月〜）

**このツール**:
- 完全ローカル実行 ✅
- データが外部に出ない ✅
- 無料 ✅

### 3. 高精度な比較
- ✅ Retina対応（scale=2）
- ✅ 動的ビューポート（Figmaのコンポーネントサイズに自動調整）
- ✅ 0.1%の差異しきい値
- ✅ Hot Reload対応（CSS変更を自動検知）

---

## 🚀 使い方

### 前提条件

```bash
# 1. Figma Personal Access Tokenを設定
export FIGMA_PERSONAL_ACCESS_TOKEN="your-token-here"

# 2. Storybookを起動（別ターミナル）
npm run storybook
```

### 基本的な使い方

#### Step 1: Figma Node IDを取得

```bash
# Figmaデザインを調査
npm run inspect-figma -- --node-id=9392:122

# 出力例:
# 🔍 Inspecting Figma Node...
#    File ID: MJTwyRbE5EVdlci3UIwsut
#    Node ID: 9392:122
#
# 🎨 This is a Component Set! Found variants:
#    [1] isSingle=true, isMultiple=false, ...
#        Node ID: 9402:206
#    [2] isSingle=false, isMultiple=true, ...
#        Node ID: 9392:121
```

#### Step 2: Design QAを実行

```bash
# 特定のVariantを検証
npm run validate-block -- --block=carousel --node-id=9392:121
```

**出力**:
```
🔄 Automated Figma-Storybook Visual Validation Loop
══════════════════════════════════════════════════════════════════════

📦 Block: carousel
🎨 Figma Node: 9392:121
📁 Figma File: MJTwyRbE5EVdlci3UIwsut
🎭 Demo Mode: OFF
🎯 Match Threshold: 0.1%

──────────────────────────────────────────────────────────────────────
📍 Iteration 1/5
──────────────────────────────────────────────────────────────────────

📐 Fetching component size from Figma...
   Component size: 1160 x 639
📥 Fetching Figma screenshot...
✅ Figma screenshot saved
📸 Capturing Storybook screenshot...
✅ Storybook screenshot saved

🔍 Comparing screenshots (pixel-by-pixel)...
   Figma size:     2320x1278
   Storybook size: 2320x1278
   📐 Comparing overlapping area: 2320x1278

📊 Comparison Results:
   Different pixels: 45,123 / 2,964,960
   Difference: 1.52%
   Diff image: .validation-screenshots/carousel-diff-iter1.png
   ❌ Images differ significantly

🔧 Analyzing differences and applying fixes...
   ⚠️  Moderate difference detected (1.52%)
   Applying spacing/color fixes...
   - margin: 0 auto (Center alignment)
✅ Applied 1 fixes to blocks/carousel/carousel.css

⏳ Waiting 3000ms for hot reload...

──────────────────────────────────────────────────────────────────────
📍 Iteration 2/5
──────────────────────────────────────────────────────────────────────

...（繰り返し）

✅ Visual match achieved! 🎉

══════════════════════════════════════════════════════════════════════
✅ Validation Complete! carousel matches Figma design.
   Final difference: 0.08%
══════════════════════════════════════════════════════════════════════

📁 All screenshots saved to: .validation-screenshots

📊 Generating HTML report...
   Report: .validation-screenshots/carousel-report.html

💡 Open report: open .validation-screenshots/carousel-report.html
```

#### Step 3: HTMLレポートを確認

```bash
open .validation-screenshots/carousel-report.html
```

**レポート内容**:
- **ステータス**: ✅ PASSED / ❌ FAILED
- **差分**: 0.08% など
- **Figma画像**: デザインの正解
- **Storybook画像**: 現在の実装
- **Diff画像**: 差分をピンク/赤でハイライト
- **修正提案**: よくある問題と修正方法
- **リンク**: FigmaとStorybookへの直リンク

---

## 📁 生成されるファイル

```
.validation-screenshots/
├── carousel-figma-iter1.png           # Figmaスクリーンショット
├── carousel-storybook-iter1.png       # Storybookスクリーンショット（初回）
├── carousel-storybook-iter2.png       # Storybookスクリーンショット（2回目）
├── carousel-diff-iter1.png            # 差分画像（初回）
├── carousel-diff-iter2.png            # 差分画像（2回目）
└── carousel-report.html               # HTMLレポート ← これを開く！
```

---

## 🎨 HTMLレポートの見方

### サマリーセクション

```
🎨 Figma-Storybook Validation Report
Block: carousel
[✅ PASSED] または [❌ FAILED]

差分: 0.08%
イテレーション: 2
しきい値: < 0.1%
```

### 比較セクション

**3画面表示**:
1. **Figma Design (Target)** - 紫のヘッダー
   - デザインの正解
2. **Storybook Implementation (Actual)** - ピンクのヘッダー
   - 現在の実装
3. **Pixel Difference** - 赤のヘッダー
   - 差分をピンク/赤でハイライト

### 修正提案セクション（失敗時のみ）

```
💡 Suggested Next Steps

✓ Visual Review: Figma（紫）とStorybook（ピンク）を比較
✓ Common Issues: spacing, colors, font-size, border-radius, padding/margin
✓ Use Figma Inspect: Figmaで正確なCSS値を取得
✓ Re-run after fixes: npm run validate-block -- --block=carousel --node-id=9392:121
✓ Vision LLM Analysis (Optional): npm run analyze-diff -- --block=carousel --iteration=2
```

---

## 🤖 Vision LLM統合（オプション）

差異の原因を**人間のように理解**し、修正提案を生成します。

### 使い方

```bash
# 1. Design QAを実行（HTMLレポートが生成される）
npm run validate-block -- --block=carousel --node-id=9392:121

# 2. Vision LLMで差分を分析
npm run analyze-diff -- --block=carousel --iteration=1
```

**出力例**:
```
🔍 Vision LLM Diff Analyzer
   Block: carousel
   Iteration: 1
   LLM: Claude Sonnet 4

📸 Loading screenshots...
🤖 Analyzing with Vision LLM...
✅ Analysis complete!

🔧 Found 3 differences:

🔴 [1] Carousel container
   Issue: Overall height is too large, causing excessive whitespace.
   CSS Property: height
   Expected: auto
   Current: 1590px
   Reasoning: The container should adapt to its content's height.
   Priority: High

🔴 [2] Slide indicators
   Issue: Spacing between indicators is too small.
   CSS Property: gap
   Expected: 16px
   Current: 8px
   Reasoning: Indicators appear cramped.
   Priority: Medium

🔴 [3] Navigation buttons
   Issue: Button color doesn't match Figma design.
   CSS Property: background-color
   Expected: var(--color-primary)
   Current: #333
   Reasoning: Using design token ensures consistency.
   Priority: Medium
```

⚠️ **セキュリティ警告**: Vision LLMはスクリーンショットを外部AI（Anthropic/OpenAI）に送信します。機密プロジェクトでは使用を控えてください。

---

## 🔧 自動修正のしくみ

### 現在の実装（ヒューリスティック）

差分パーセンテージに基づいて、一般的な修正を適用します:

```javascript
if (diffPercentage > 50) {
  // 大きな差異: レイアウト調整
  fixes.push({ property: 'width', value: '100%' });
  fixes.push({ property: 'max-width', value: '1200px' });
} else if (diffPercentage > 20) {
  // 中程度の差異: スペーシング/配置
  fixes.push({ property: 'margin', value: '0 auto' });
} else if (diffPercentage > 5) {
  // 小さな差異: ボックスモデル
  fixes.push({ property: 'box-sizing', value: 'border-box' });
}
```

### 将来の拡張（Figma Styles API + Vision LLM）

1. **Figma Styles API**でデザイントークンを取得
2. **Vision LLM**で差異を分析
3. **正確なCSS値**を自動適用

```javascript
// 例:
fixes.push({
  property: 'gap',
  value: 'var(--spacing-m)', // Design token
  reasoning: 'Figma Variable: spacing/m = 16px'
});
```

---

## 🔄 ワークフロー

### 新しいブロック開発時

```bash
# 1. Figmaデザインを確認
npm run inspect-figma -- --node-id=<component-set-id>

# 2. 各Variantのアセットをダウンロード
npm run download-all-variants -- --block=carousel --node-id=<component-set-id>

# 3. ブロック実装（CSS/JS/Stories）
code blocks/carousel/

# 4. Design QA実行（各Variant）
npm run validate-block -- --block=carousel --node-id=<variant-id-1>
npm run validate-block -- --block=carousel --node-id=<variant-id-2>

# 5. HTMLレポート確認
open .validation-screenshots/carousel-report.html

# 6. 必要に応じてCSS修正
code blocks/carousel/carousel.css

# 7. 再度検証
npm run validate-block -- --block=carousel --node-id=<variant-id-1>
```

### PR作成前のチェック

```bash
# すべてのブロックをDesign QA
for block in carousel hero accordion cards; do
  npm run validate-block -- --block=$block --node-id=<node-id>
done

# HTMLレポートをPRに添付（任意）
git add .validation-screenshots/*.html
```

---

## 🎯 しきい値の調整

`scripts/compare-figma-storybook.js` の28行目:

```javascript
const MATCH_THRESHOLD = 0.1; // 0.1% threshold

// より厳しく（ピクセルパーフェクト）
const MATCH_THRESHOLD = 0.01;

// より緩く（大まかな一致）
const MATCH_THRESHOLD = 1.0;
```

---

## 💡 Tips

### Tip 1: Figma Component SetとVariants

**Component Set**（親）には複数の**Variants**（子）があります:

```bash
# Component Setを調査
npm run inspect-figma -- --node-id=9392:122

# 出力:
# 🎨 This is a Component Set! Found variants:
#    [1] Variant A: Node ID 9402:206
#    [2] Variant B: Node ID 9392:121
```

**各Variant**を個別に検証します:

```bash
npm run validate-block -- --block=carousel --node-id=9402:206
npm run validate-block -- --block=carousel --node-id=9392:121
```

### Tip 2: イテレーション数の調整

`scripts/compare-figma-storybook.js` の26行目:

```javascript
const MAX_ITERATIONS = 5; // 最大5回

// より多くの修正を試みる
const MAX_ITERATIONS = 10;

// 手動修正を推奨
const MAX_ITERATIONS = 1;
```

### Tip 3: HTMLレポートの活用

- **PR添付**: GitHubのPRにHTMLレポートを添付し、視覚的なレビューを実施
- **CI/CD**: GitHub Actionsでアーティファクトとしてアップロード
- **アーカイブ**: 定期的にレポートを保存し、デザイン変更の履歴を追跡

---

## 🚀 今後の拡張

### Phase 1: Figma Styles API統合（実装済み）
- ✅ `npm run extract-styles` でFigma Variablesを抽出
- ✅ `boundVariables` から直接デザイントークンをマッピング

### Phase 2: 自動修正の精度向上（進行中）
- 🔄 Vision LLMによる差異分析
- 🔄 Figma API + Vision LLMのハイブリッド修正

### Phase 3: CI/CD完全統合
- ⏳ GitHub ActionsでDesign QA自動実行
- ⏳ PR Commentに結果を自動投稿
- ⏳ Figma Webhookで変更通知

### Phase 4: 複数ビューポート対応
- ⏳ Desktop/Tablet/Mobileを並行テスト

---

## 🆚 他のツールとの比較

| ツール | 比較対象 | コスト | 実行環境 | データプライバシー |
|-------|---------|--------|---------|------------------|
| **Chromatic** | Storybook vs Storybook | $149/月〜 | クラウド | ⚠️ スクリーンショット送信 |
| **Percy** | Storybook vs Storybook | $299/月〜 | クラウド | ⚠️ スクリーンショット送信 |
| **Applitools** | Storybook vs Storybook | $99/月〜 | クラウド | ⚠️ スクリーンショット送信 |
| **このツール** | **Figma vs Storybook** | **無料** | **ローカル** | **✅ 完全ローカル** |

---

## ❓ FAQ

**Q: ChromaticのVisual Regressionとの違いは？**  
A: Chromaticは「Storybook（過去）vs Storybook（現在）」の比較（実装の劣化検知）。このツールは「**Figma（デザイン）vs Storybook（実装）**」の比較（デザインQA）です。

**Q: 両方使うべき？**  
A: はい。
- **Design QA**（このツール）: デザインと実装の一致を検証
- **Visual Regression**（Chromatic/Local VR）: 実装の劣化を検知

**Q: HTMLレポートはGitにコミットすべき？**  
A: 推奨しません。`.gitignore`に追加し、PRに必要なら手動で添付します。

**Q: Vision LLMは必須？**  
A: いいえ。オプションです。ヒューリスティック修正だけでも動作します。Vision LLMはより詳細な分析が必要な場合に使用します。

**Q: 実行が遅い場合は？**  
A: 
- Storybookをビルドモード（`npm run build-storybook`）で実行
- `MAX_ITERATIONS`を減らす
- `HOT_RELOAD_WAIT`を短縮（ただし修正が反映されない可能性）

**Q: 複数のブロックを一括テストできる？**  
A: 現在は個別実行のみ。将来的には一括テスト機能を追加予定。

---

これで、**完全自動化されたFigma-Storybook Design QA + HTMLレポート**が実現します！🎨
