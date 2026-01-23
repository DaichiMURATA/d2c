# Figma-Storybook Visual Validation Prompt

このプロンプトをCursorのチャットやコンポーザーで使用して、ブロックのビジュアル比較を実行できます。

---

## 🎯 基本的な使い方

Cursorで以下のように指示してください：

### 全ストーリー検証（デフォルト）

```
[block-name]ブロックのFigma-Storybook比較を実行して
```

例：
- `heroブロックのFigma-Storybook比較を実行して`
- `accordionブロックを検証して`
- `cardsブロックのビジュアル比較をして`

**💡 重要**: ストーリー指定がない場合、そのブロックの**全てのストーリー**を順次検証します。

例：`cardsブロックを検証して` → Cards の全4 Variant を検証

---

## 📋 詳細な指示例

### 全ストーリー検証
```
cardsブロックのFigma-Storybook比較を実行して、
全てのVariantについてHTMLレポートを作成して
```
→ Cards の全4 Variant を順次検証

### 単一ブロック検証
```
heroブロックのFigma-Storybook比較を実行して、
HTMLレポートを開いて差異を確認したい
```
→ Hero の1つのストーリーを検証

### 特定のストーリーのみ検証
```
accordionブロックのHoverClosedストーリーについて、
Figmaと比較してビジュアルの差異をチェックして
```
→ Accordion の特定のストーリーのみ検証

### 複数ブロック
```
以下のブロックについて順番にFigma比較を実行して：
1. hero
2. cards
3. accordion
```

---

## 🤖 AI実行フロー

AIは以下の手順で自動実行します：

1. **ブロック名を抽出**
   - ユーザーの指示からブロック名を特定

2. **コマンド実行**
   
   **全ストーリー検証**（デフォルト）：
   ```bash
   npm run validate-block -- --block=[block-name]
   ```
   → そのブロックの全てのFigma Variant/Storybook Storyを順次検証
   
   **特定のストーリーのみ検証**：
   ```bash
   npm run validate-block -- --block=[block-name] --story=[story-name]
   ```
   → 指定したストーリーのみを検証

3. **結果確認**
   
   **単一ストーリー検証時**：
   - HTMLレポートが自動的にブラウザで開く
   - ターミナル出力で差異パーセンテージを確認
   
   **複数ストーリー検証時**：
   - 各ストーリーごとに順次検証
   - 全体のサマリーテーブル表示（Pass/Fail、差異%）
   - 最後のレポートが自動的にブラウザで開く
   - 個別のHTMLレポートがストーリーごとに生成される

4. **次のアクション提示**
   - 差異が大きい場合：手動修正の提案
   - 差異が小さい場合：問題なしと報告
   - 複数失敗時：優先度の高いVariantから修正を提案

---

## 💡 応用例

### Vision AI分析と組み合わせ
```
heroブロックを検証して、
もし差異があればVision AIで分析してください
```

### 全ブロック一括検証
```
Figma URLが設定されている全てのブロックを
順番に検証してレポートを作成して
```

### 反復修正ワークフロー
```
1. heroブロックを検証
2. 差異があればStorybookで確認
3. CSSを手動修正
4. 再度検証
5. 差異が1%以下になるまで繰り返し
```

---

## 🚨 注意事項

実行前に確認：
- ✅ Storybookが起動している (`npm run storybook`)
- ✅ `FIGMA_PERSONAL_ACCESS_TOKEN`が設定されている
- ✅ 対象ブロックのStoriesファイルが存在する

---

## 📝 出力内容

コマンド実行後、以下が生成されます：

### 単一ストーリー検証時

1. **スクリーンショット**（`.validation-screenshots/`）
   - `[block]-figma-iter1.png`
   - `[block]-storybook-iter1.png`
   - `[block]-diff-iter1.png`

2. **HTMLレポート**
   - `[block]-report.html`（自動的にブラウザで開く）

3. **ターミナル出力**
   - 差異パーセンテージ
   - Figma Node ID
   - ファイルパス

### 複数ストーリー検証時

1. **スクリーンショット**（`.validation-screenshots/`、ストーリーごと）
   - `[block]-[story]-figma-iter1.png`
   - `[block]-[story]-storybook-iter1.png`
   - `[block]-[story]-diff-iter1.png`

2. **HTMLレポート**（各ストーリーごと、**上書きされない**）
   - `[block]-[story]-report.html`
   
   例：Cards の場合
   - `cards-WithImageNoLink-report.html`
   - `cards-WithImageWithLink-report.html`
   - `cards-NoImageNoLink-report.html`
   - `cards-NoImageWithLink-report.html`

3. **ターミナル出力**
   - 各ストーリーの検証プロセス
   - 最後に全体サマリーテーブル（Pass/Fail、差異%）

---

## 🔄 継続的なワークフロー

### 1. 初回検証
```
heroブロックを検証して
```

### 2. 差異確認
AIがHTMLレポートを開き、差異を報告

### 3. 修正提案
```
hero.cssを開いて、Figmaとの差異を修正したい。
特に[具体的な箇所]を調整して
```

### 4. 再検証
```
heroブロックを再度検証して、差異が改善されたか確認
```

### 5. 完了
差異が閾値以下になるまで繰り返し

---

## 📚 関連コマンド

手動実行する場合：
```bash
# 全ストーリー検証（デフォルト）
npm run validate-block -- --block=cards
→ Cards の全4 Variant を順次検証

# 単一ブロック検証
npm run validate-block -- --block=hero
→ Hero の1つのストーリーを検証

# 特定のストーリーのみ検証
npm run validate-block -- --block=accordion --story=HoverClosed
→ Accordion の HoverClosed ストーリーのみ検証

# Figmaコンポーネント検索
npm run discover-components -- --filter=Hero
```
