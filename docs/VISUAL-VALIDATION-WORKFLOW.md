# Visual Validation Workflow

簡単な指示でFigma-Storybookのビジュアル比較を実行できます。

---

## 🚀 クイックスタート

### Cursorで指示するだけ

```
heroブロックのFigma-Storybook比較を実行して
```

これだけで：
1. ✅ Figmaスクリーンショット取得
2. ✅ Storybookスクリーンショット取得
3. ✅ Pixelmatch比較（差異検出）
4. ✅ HTMLレポート生成
5. ✅ **ブラウザで自動表示**

---

## 📋 使用例

### 基本的な検証

```
heroブロックを検証して
```

```
accordionブロックのビジュアル比較をして
```

```
cardsブロックをチェックして
```

**💡 重要**: ストーリー指定がない場合、そのブロックの**全てのストーリー**を順次検証します。

例：`cardsブロックを検証して` → Cards の全4 Variantを検証
- WithImageNoLink
- WithImageWithLink
- NoImageNoLink
- NoImageWithLink

### 特定のストーリー

```
accordionブロックのHoverClosedストーリーを検証して
```

```
carouselのMultipleSlidesNoContentを比較して
```

### 複数ブロック

```
以下のブロックを順番に検証して：
- hero
- accordion
- cards
- quote
```

### 反復修正ワークフロー

```
1. heroブロックを検証
2. 差異を確認
3. hero.cssを修正
4. 再度検証
5. 差異が1%以下になるまで繰り返し
```

---

## 🎯 AIの実行フロー

ユーザーがCursorで指示すると、AIは以下を自動実行：

### 1. ブロック名抽出
ユーザーの指示から対象ブロック名を特定

### 2. コマンド実行

**全ストーリーを検証**（指定なし）：
```bash
npm run validate-block -- --block=[block-name]
```
→ そのブロックの全てのFigma Variant/Storybook Storyを順次検証

**特定のストーリーのみ検証**：
```bash
npm run validate-block -- --block=[block-name] --story=[story-name]
```
→ 指定したストーリーのみを検証

### 3. Node ID自動解決

優先順位：
1. **Storybook Stories** (`parameters.design.url`)
2. **Config File** (`config/figma/figma-urls.json`)
3. **Figma API検索**（ファイル全体を巡回）

### 4. ビジュアル比較

- Figma API経由でデザインをキャプチャ
- Playwright経由でStorybookをキャプチャ
- Pixelmatchでピクセル単位比較

### 5. レポート生成・表示

- HTMLレポート自動生成
- ブラウザで自動的に開く
- Figma/Storybook/Diffを3列表示

### 6. 結果報告

**単一ストーリー検証時**：
```
📊 Comparison Results:
   Difference: 10.50%
   Threshold: 0.1%
   ❌ Images differ significantly

📁 Screenshots:
   - Figma: .validation-screenshots/hero-figma-iter1.png
   - Storybook: .validation-screenshots/hero-storybook-iter1.png
   - Diff: .validation-screenshots/hero-diff-iter1.png
   - Report: .validation-screenshots/hero-report.html

🌐 Report opened in browser
```

**複数ストーリー検証時（全体検証）**：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Validating Story 1 of 4: WithImageNoLink
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Validating Story 2 of 4: WithImageWithLink
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...

══════════════════════════════════════════════
📊 VALIDATION SUMMARY: cards
══════════════════════════════════════════════

✅ Passed: 1
❌ Failed: 3
📝 Total:  4

Detailed Results:

  1. ❌ WithImageNoLink              - Diff: 47.06%
     Report: .validation-screenshots/cards-WithImageNoLink-report.html
  2. ❌ WithImageWithLink            - Diff: 45.23%
     Report: .validation-screenshots/cards-WithImageWithLink-report.html
  3. ✅ NoImageNoLink                - Diff: 0.05%
     Report: .validation-screenshots/cards-NoImageNoLink-report.html
  4. ❌ NoImageWithLink              - Diff: 12.34%
     Report: .validation-screenshots/cards-NoImageWithLink-report.html

══════════════════════════════════════════════

🌐 Opening last report (NoImageWithLink) in browser...
```

### 7. 次のアクション提案

- **差異 > 5%**: 手動CSSレビューを推奨
- **差異 1-5%**: 微調整を提案
- **差異 < 1%**: 成功として報告

---

## 📁 生成されるファイル

`.validation-screenshots/` ディレクトリ：

### 単一ストーリー検証時

```
.validation-screenshots/
├── hero-figma-iter1.png       # Figmaデザイン
├── hero-storybook-iter1.png   # Storybook実装
├── hero-diff-iter1.png         # 差分（赤色ハイライト）
└── hero-report.html            # HTMLレポート（自動表示）
```

### 複数ストーリー検証時（全体検証）

```
.validation-screenshots/
├── cards-WithImageNoLink-figma-iter1.png
├── cards-WithImageNoLink-storybook-iter1.png
├── cards-WithImageNoLink-diff-iter1.png
├── cards-WithImageNoLink-report.html
├── cards-WithImageWithLink-figma-iter1.png
├── cards-WithImageWithLink-storybook-iter1.png
├── cards-WithImageWithLink-diff-iter1.png
├── cards-WithImageWithLink-report.html
├── cards-NoImageNoLink-figma-iter1.png
├── cards-NoImageNoLink-storybook-iter1.png
├── cards-NoImageNoLink-diff-iter1.png
├── cards-NoImageNoLink-report.html
├── cards-NoImageWithLink-figma-iter1.png
├── cards-NoImageWithLink-storybook-iter1.png
├── cards-NoImageWithLink-diff-iter1.png
└── cards-NoImageWithLink-report.html
```

**💡 ストーリー名がファイル名に含まれるため、上書きされません。**

---

## ⚙️ 前提条件

実行前に確認：

### 1. Storybookが起動している
```bash
npm run storybook
```

### 2. 環境変数が設定されている
```bash
FIGMA_PERSONAL_ACCESS_TOKEN=figd_xxxxx
```

### 3. Figma URLが設定されている

いずれかの方法で：

#### A. Storybook Stories（推奨）
```javascript
export const Default = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/FILE_ID/FILE_NAME?node-id=XXXX-YYYY',
    },
  },
};
```

#### B. Config File
```json
{
  "components": {
    "hero": {
      "nodeId": "8668:498",
      "variants": {
        "Default": "8668:498"
      }
    }
  }
}
```

#### C. Figma検索（フォールバック）
設定がなくても、Figma APIで自動検索します

---

## 🎨 HTMLレポートの見方

自動的に開くHTMLレポートには：

### 1. ヘッダー
- ブロック名
- 差異パーセンテージ
- 合否判定（✅ or ❌）

### 2. 3列比較
- **左**: Figmaデザイン（紫色の枠）
- **中央**: Storybook実装（ピンク色の枠）
- **右**: 差分画像（赤色ハイライト）

### 3. 提案
- 一般的な問題点（spacing、colors、font-size等）
- 次のアクション
- Vision AI分析の実行方法

### 4. メタデータ
- Figma URL（クリックでFigmaを開く）
- 生成日時
- スクリーンショットパス

---

## 🔄 反復修正の例

### Step 1: 初回検証
```
heroブロックを検証して
```

**結果**: 差異 10.50%

### Step 2: 差異確認
HTMLレポートで具体的な差異を確認：
- Headingが下にずれている
- フォントサイズが異なる
- 背景画像の位置が違う

### Step 3: CSS修正
```
hero.cssを開いて、以下を修正：
- paddingを40pxに変更
- font-sizeを44pxに変更
- background-positionをcenter bottomに変更
```

### Step 4: 再検証
```
heroブロックを再度検証
```

**結果**: 差異 3.2%（改善！）

### Step 5: 微調整
さらに調整を繰り返し...

**最終結果**: 差異 0.8%（✅ 成功）

---

## 💡 Tips

### 全ブロック一括検証
```
Figma URLが設定されている全てのブロックについて、
順番に検証してサマリーレポートを作成して
```

### 差異が大きい場合
```
heroブロックの差異が10%以上あるので、
主な問題点をリストアップして
```

### 特定の箇所に注目
```
heroブロックのHeading部分だけをクロップして
詳細に比較したい
```

### 手動コマンド実行
```bash
# 基本
npm run validate-block -- --block=hero

# ストーリー指定
npm run validate-block -- --block=accordion --story=HoverClosed

# Node ID手動指定
npm run validate-block -- --block=hero --node-id=8668:498
```

---

## 🚨 トラブルシューティング

### Storybookが起動していない
```
❌ Storybook is not running at http://localhost:6006

💡 Start Storybook first: npm run storybook
```

### Figma Token未設定
```
❌ FIGMA_PERSONAL_ACCESS_TOKEN not set

💡 Set environment variable:
export FIGMA_PERSONAL_ACCESS_TOKEN=figd_xxxxx
```

### Node IDが見つからない
```
❌ Could not find Figma node-id for block: hero

💡 Solutions:
1. Add Figma URL to hero.stories.js
2. Run: npm run discover-components -- --filter=hero
3. Specify manually: --node-id=XXXX:YYYY
```

### Storyが存在しない
```
⚠️  Story "NonExistent" not found in hero.stories.js
Available stories: Default, WithImage, ...
```

---

## 📚 関連ドキュメント

- **プロンプトテンプレート**: `prompts/validate-block-prompt.md`
- **スクリプト詳細**: `scripts/compare-figma-storybook.js`
- **設定ファイル**: `config/figma/figma-urls.json`
- **Cursor Rules**: `.cursorrules` (自動実行フロー定義)

---

## 🎯 まとめ

### Before（複雑）
```bash
npm run validate-block -- --block=hero --node-id=8668:498 --file-id=MJTwyRbE5EVdlci3UIwsut
```

### After（シンプル）
```
heroブロックを検証して
```

たったこれだけで：
✅ Node ID自動解決
✅ スクリーンショット取得
✅ ビジュアル比較
✅ HTMLレポート生成
✅ ブラウザで自動表示

プロンプトベースで簡単にビジュアル検証ができます！🎉
