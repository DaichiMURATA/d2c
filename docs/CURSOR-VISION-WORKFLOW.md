# Cursor経由でのVision分析と反復修正ワークフロー

## 🎯 概要

CursorのAIアシスタント（Composer）でClaude Vision APIを活用し、FigmaデザインとStorybook実装の視覚的差分を分析・修正するワークフローです。

**メリット**:
- ✅ Cursor内で完結（別ツール不要）
- ✅ 対話的な分析と修正
- ✅ プロンプトを調整しながら最適化可能
- ✅ 反復処理も指示可能

---

## 🚀 クイックスタート

### Step 1: スクリーンショット生成

```bash
npm run validate-block -- --block=carousel --node-id=9392:121
```

これにより以下が生成されます：
- `.validation-screenshots/carousel-figma-iter1.png` (Figmaデザイン)
- `.validation-screenshots/carousel-storybook-iter1.png` (Storybook実装)
- `.validation-screenshots/carousel-diff-iter1.png` (ピクセル差分)

### Step 2: Cursor Composerで分析

1. **Cursor Composerを開く** (Cmd+I / Ctrl+I)
2. **Claudeモデルを選択** (Claude Sonnet 4 または Claude 3.5 Sonnet)
3. **3つの画像をドラッグ&ドロップ**
   - Figmaデザイン画像
   - Storybook実装画像
   - ピクセル差分画像
4. **プロンプトテンプレートを貼り付け**

プロンプトテンプレートは `prompts/vision-analysis-prompt.md` を参照してください。

### Step 3: 分析結果を確認

ClaudeがJSON形式で分析結果を返します：

```json
{
  "overallAssessment": "主要な問題の要約",
  "differences": [
    {
      "element": "要素名",
      "issue": "問題の説明",
      "cssProperty": "CSSプロパティ",
      "expectedValue": "期待値",
      "currentValue": "現在値",
      "priority": "High|Medium|Low",
      "reasoning": "修正が必要な理由"
    }
  ]
}
```

### Step 4: CSS修正を適用

Cursor Composerで指示：

```
Vision分析の結果に基づいて、以下のCSS修正を blocks/carousel/carousel.css に適用してください：

1. [High Priority] インジケーターの間隔を修正:
   .carousel-indicators {
     gap: 16px; /* 現在: 8px */
   }

2. [High Priority] コンテナの高さを修正:
   .carousel {
     height: auto; /* 現在: 1590px */
   }
```

### Step 5: 再検証と反復

```bash
npm run validate-block -- --block=carousel --node-id=9392:121
```

差分が5%未満になるまで、または最大5回まで繰り返します。

---

## 🔄 完全な反復処理ワークフロー

### 方法1: 手動で各ステップを実行

```
1. スクリーンショット生成
   npm run validate-block -- --block=carousel --node-id=9392:121

2. Cursor Composerで分析
   - 画像をアップロード
   - プロンプトを貼り付け
   - 分析結果を確認

3. CSS修正を適用
   "High priorityの修正を blocks/carousel/carousel.css に適用"

4. 再検証
   npm run validate-block -- --block=carousel --node-id=9392:121

5. ステップ2-4を繰り返し（最大5回）
```

### 方法2: Cursorに一括指示

Cursor Composerで以下のように指示：

```
carouselブロックをFigmaデザインに合わせて反復的に修正してください。

現在の状況:
- ブロック名: carousel
- Figma node ID: 9392:121
- 現在の視覚的差分: 12.5% (目標: < 5%)

以下の手順を実行してください:
1. npm run validate-block -- --block=carousel --node-id=9392:121 を実行
2. .validation-screenshots/ から3つのスクリーンショットを読み込む
3. Claude Visionで差分を分析
4. High priorityのCSS修正を適用
5. 再検証を実行
6. 差分が5%未満になるか、5回繰り返すまで続ける

各反復後に以下を表示してください:
- 現在の差分パーセンテージ
- 適用した修正
- 残っている問題
```

**注意**: Cursorは画像を直接読み込めないため、手動で画像をアップロードする必要があります。ただし、分析と修正の指示は一括で行えます。

### 画像読み込みの制約と回避策

**現状の制約**:
- ❌ Cursor Composerは画像ファイルをファイルパスで直接参照できません
- ❌ `@file .validation-screenshots/carousel-figma-iter1.png` のような指定は動作しません
- ✅ 画像は**ドラッグ&ドロップ**または**クリップボード経由**でのみ読み込めます

**回避策**:

#### 方法1: ファイルパス指定を試す（動作するか未確認）

```
以下の画像を分析してください:
@file .validation-screenshots/carousel-figma-iter1.png
@file .validation-screenshots/carousel-storybook-iter1.png
@file .validation-screenshots/carousel-diff-iter1.png
```

**注意**: この方法が動作するかはCursorのバージョンに依存します。動作しない場合は方法2を使用してください。

#### 方法2: スクリプトで画像を開く（推奨）

```bash
# macOS - Finderでフォルダを開く
open .validation-screenshots/

# または、個別の画像を開く
open .validation-screenshots/carousel-figma-iter1.png
open .validation-screenshots/carousel-storybook-iter1.png
open .validation-screenshots/carousel-diff-iter1.png
```

その後、開いた画像をCursor Composerにドラッグ&ドロップします。

#### 方法3: Node.jsスクリプトを使用（完全自動化）

画像の手動読み込みを避けたい場合は、既存のNode.jsスクリプトを使用：

```bash
npm run analyze-diff -- --block=carousel --iteration=1
```

この方法なら完全に自動化できますが、対話的な調整はできません。

**推奨ワークフロー**:
- **プロトタイプ・検証**: 方法2（手動アップロード + Cursor Composer）
- **本番・自動化**: 方法3（Node.jsスクリプト）

---

## 📋 プロンプトテンプレート

詳細なプロンプトテンプレートは `prompts/vision-analysis-prompt.md` を参照してください。

主要なポイント：
- 3つの画像を明確に識別（Figma、Storybook、差分）
- JSON形式での構造化出力を要求
- 優先度（High/Medium/Low）を含める
- 実行可能なCSS修正に焦点を当てる

---

## 🎨 実践例

### 例1: 一回限りの分析

```
[画像3枚をアップロード後]

これらの画像を比較してください。1枚目がFigmaデザイン（正解）、
2枚目がStorybook実装（現在）、3枚目がピクセル差分です。

JSON形式で分析結果を出力してください：
{
  "differences": [
    {
      "element": "要素名",
      "cssProperty": "プロパティ名",
      "expectedValue": "期待値",
      "currentValue": "現在値",
      "priority": "High|Medium|Low"
    }
  ]
}
```

### 例2: 反復的な修正

```
carouselブロックの視覚的差分を5%未満にするまで修正してください。

1. スクリーンショット生成
2. Vision分析
3. High priority修正を適用
4. 再検証
5. 繰り返し

各反復で進捗を報告してください。
```

---

## 🔍 .cursorrulesとの統合

`.cursorrules`ファイルに以下のセクションが追加されています：

- **Vision AI Analysis & Iterative Refinement via Cursor Composer**
- **Workflow: Vision Analysis via Cursor Composer**
- **Iterative Refinement Loop via Cursor**
- **Integration with Existing Validation Scripts**

詳細は `.cursorrules` を参照してください。

---

## 💡 ベストプラクティス

### 1. 優先度に基づいた修正

- **High priority**: まず修正（レイアウト崩れ、大きなサイズ違い）
- **Medium priority**: 次に修正（色の微調整、間隔の微調整）
- **Low priority**: 最後に修正（細かい調整）

### 2. バッチ処理

類似の修正をグループ化：

```
以下のレイアウト関連の修正を一括適用:
- gap: 8px → 16px
- padding: 12px → 24px
- margin-top: 0 → 16px
```

### 3. 各反復で検証

すべての修正を一度に適用せず、各バッチの後に検証：

```
1. High priority修正を適用
2. 検証実行
3. 差分が改善したか確認
4. Medium priority修正に進む
```

### 4. デザイントークンの使用

可能な限りCSS Custom Propertiesを使用：

```css
/* ❌ ハードコード */
.carousel-indicators {
  gap: 16px;
}

/* ✅ デザイントークン */
.carousel-indicators {
  gap: var(--spacing-m);
}
```

---

## 🆚 Cursor Composer vs Node.jsスクリプト

| 観点 | Cursor Composer | Node.jsスクリプト |
|------|----------------|------------------|
| **セットアップ** | 不要 | APIキー設定必要 |
| **実行速度** | 中速（対話的） | 高速（自動化） |
| **CI/CD統合** | 不可 | 可能 |
| **バッチ処理** | 手動 | 自動 |
| **反復処理** | 指示可能 | 自動化可能 |
| **プロンプト調整** | 容易 | コード修正必要 |
| **一回限りの分析** | 最適 | 過剰 |

**推奨**:
- **プロトタイプ・検証**: Cursor Composer
- **本番・自動化**: Node.jsスクリプト
- **反復的な手動修正**: Cursor Composer

---

## 🔗 関連ファイル

- `.cursorrules` - メインのルールファイル（Vision分析セクション追加済み）
- `prompts/vision-analysis-prompt.md` - プロンプトテンプレート
- `scripts/analyze-diff-with-vision.js` - Node.jsスクリプト版（自動化用）
- `docs/VISION-LLM-INTEGRATION.md` - Vision LLM統合ガイド

---

## 📚 参考資料

- [Claude Vision API Documentation](https://docs.anthropic.com/claude/docs/vision)
- [Cursor Composer Documentation](https://cursor.sh/docs)
- [Figma vs Storybook Validation Guide](./FIGMA-STORYBOOK-DESIGN-QA.md)

---

**Last Updated**: 2026-01-19
