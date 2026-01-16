# Local Visual Regression Testing

**🔒 完全ローカル、外部API不要のVisual Regression Testing**

Chromaticと同様の機能をローカル環境で実現します。

---

## 🎯 特徴

### Chromaticとの比較

| 機能 | Chromatic | Local VR |
|-----|-----------|----------|
| **実行環境** | クラウド | ローカル |
| **コスト** | 有料（$149/月〜） | 無料 |
| **外部API** | 必要 | 不要 |
| **セキュリティ** | スクリーンショットをクラウドに送信 | 完全ローカル ✅ |
| **ベースライン管理** | クラウド | Git |
| **HTMLレポート** | ✅ | ✅ |
| **CI/CD統合** | ✅ | ✅ |
| **チーム共有** | ✅ | Git経由 |
| **差分表示** | ✅ | ✅ |

### メリット

- ✅ **完全無料**
- ✅ **機密情報保護**（スクリーンショットが外部に送信されない）
- ✅ **高速**（ローカル実行）
- ✅ **オフライン動作**
- ✅ **カスタマイズ可能**

### デメリット

- ❌ チーム間での即時共有は手動（Git経由）
- ❌ クラウドストレージなし

---

## 🚀 使い方

### 基本的な使い方

#### Step 1: 初回ベースライン作成

```bash
# Storybookを起動（別ターミナル）
npm run storybook

# ベースラインを作成
npm run visual-test -- --block=carousel --update-baseline
```

**結果**:
- `.visual-regression/baseline/` にスクリーンショットが保存される
- これがGitで管理される「正解」となる

#### Step 2: 開発中の変更チェック

```bash
# コードを修正

# Visual Regressionテストを実行
npm run visual-test -- --block=carousel
```

**結果**:
- ベースラインと現在の実装を比較
- 差分があれば `.visual-regression/diff/` に差分画像を生成
- HTMLレポートが `.visual-regression/report.html` に生成される

#### Step 3: レポート確認

```bash
# HTMLレポートをブラウザで開く
open .visual-regression/report.html
```

**レポート内容**:
- サマリー（Total/Passed/Failed）
- 各Storyの比較（Baseline vs Actual vs Diff）
- 差分パーセンテージ

#### Step 4: 意図的な変更の場合はベースライン更新

```bash
# 変更が意図的なものであれば、ベースラインを更新
npm run visual-test -- --block=carousel --update-baseline

# Gitにコミット
git add .visual-regression/baseline/
git commit -m "Update visual regression baseline for carousel"
```

---

## 📁 ファイル構成

```
.visual-regression/
├── baseline/              # ベースライン（Gitで管理）
│   ├── README.md
│   ├── carousel-SingleSlideCenteredFullContent.png
│   ├── carousel-MultipleSlidesNoContent.png
│   └── ...
├── actual/                # 実行時の最新スクリーンショット（Git無視）
│   └── ...
├── diff/                  # 差分画像（Git無視）
│   └── ...
└── report.html            # HTMLレポート（Git無視）
```

---

## 🔄 ワークフロー

### 開発フロー

```bash
# 1. Storybook起動
npm run storybook

# 2. コードを修正
code blocks/carousel/carousel.css

# 3. Visual Testを実行
npm run visual-test -- --block=carousel

# 4. レポート確認
open .visual-regression/report.html

# 5a. 意図しない変更の場合 → コードを修正して再実行
# 5b. 意図的な変更の場合 → ベースライン更新
npm run visual-test -- --block=carousel --update-baseline
```

### PR作成前のチェック

```bash
# すべてのブロックをテスト（スクリプト拡張が必要）
npm run visual-test -- --block=carousel
npm run visual-test -- --block=hero
npm run visual-test -- --block=accordion

# すべてパスすることを確認
# 失敗した場合、意図的な変更ならベースライン更新
```

---

## 🤖 CI/CD統合

### GitHub Actions での使用例

```yaml
name: Visual Regression Test

on: [pull_request]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Storybook
        run: npm run build-storybook
      
      - name: Start Storybook
        run: npx http-server storybook-static -p 6006 &
      
      - name: Wait for Storybook
        run: npx wait-on http://localhost:6006
      
      - name: Run Visual Regression Tests
        run: npm run visual-test -- --block=carousel
      
      - name: Upload report on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-report
          path: .visual-regression/
```

---

## 🎨 使用例

### Example 1: Carouselブロックのテスト

```bash
# 1. ベースライン作成（初回のみ）
npm run visual-test -- --block=carousel --update-baseline
```

**出力**:
```
🎨 Local Visual Regression Testing

   Block: carousel
   Mode: Update Baseline

📋 Loading stories...
   Found 6 stories

📸 SingleSlideCenteredFullContent...
   ✅ Baseline updated
📸 MultipleSlidesNoContent...
   ✅ Baseline updated
...

✅ Baseline updated for all stories
```

```bash
# 2. CSS修正
code blocks/carousel/carousel.css
# gap: 8px → gap: 16px に変更

# 3. Visual Test実行
npm run visual-test -- --block=carousel
```

**出力**:
```
🎨 Local Visual Regression Testing

   Block: carousel
   Mode: Compare

📋 Loading stories...
   Found 6 stories

📸 SingleSlideCenteredFullContent...
   ✅ 0.05% different
📸 MultipleSlidesNoContent...
   ❌ 2.34% different
...

📊 Generating HTML report...
   Report: /path/to/.visual-regression/report.html

═══════════════════════════════════════════════════════════════════
📊 Results: 5 passed, 1 failed
═══════════════════════════════════════════════════════════════════

❌ Visual regression detected!
   Open report to review: /path/to/.visual-regression/report.html
```

```bash
# 4. レポート確認
open .visual-regression/report.html

# 5. 変更が意図的なら、ベースライン更新
npm run visual-test -- --block=carousel --update-baseline
```

---

## 🔧 カスタマイズ

### 差分しきい値の変更

`scripts/visual-regression-local.js` の159行目:

```javascript
const passed = diffPercentage < 0.1; // 0.1% threshold

// より厳しく
const passed = diffPercentage < 0.01; // 0.01% threshold

// より緩く
const passed = diffPercentage < 1.0; // 1% threshold
```

### ビューポートサイズの変更

84行目:

```javascript
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 2,
});

// 例: モバイル
const page = await browser.newPage({
  viewport: { width: 375, height: 667 },
  deviceScaleFactor: 3,
});
```

### 複数ビューポートでテスト

将来の拡張として、複数ビューポートでの並行テストも可能：

```javascript
const viewports = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

for (const viewport of viewports) {
  // Test each viewport
}
```

---

## 📊 HTMLレポート

### レポートの見方

**サマリーセクション**:
- Total Tests: 実行されたStoryの数
- Passed: 差分なし（または許容範囲内）
- Failed: 差分あり

**各Storyのカード**:
- 左: Baseline（正解）
- 右: Actual（現在の実装）
- 下: Diff（差分を赤/ピンクで表示）

**差分パーセンテージ**:
- 0%: 完全一致
- < 0.1%: 許容範囲（パス）
- ≥ 0.1%: 差分あり（フェイル）

---

## 🆚 他のツールとの比較

### vs Chromatic
- **コスト**: Chromatic（有料）vs Local（無料）
- **セキュリティ**: Chromatic（クラウド）vs Local（完全ローカル）✅
- **機能**: ほぼ同等

### vs Percy
- 同様に、Percy（有料）vs Local（無料）
- Local VRの方がセキュアで経済的

### vs Playwright Visual Comparisons（公式）
- 今回の実装は、Playwright公式機能のラッパー
- より使いやすいインターフェースを提供

---

## 💡 Tips

### Tip 1: ベースラインはGitで管理
```bash
# .gitignore で actual/ と diff/ は除外
# baseline/ のみをコミット
git add .visual-regression/baseline/
git commit -m "Add visual regression baselines"
```

### Tip 2: PRレビューで活用
```bash
# PR前に全ブロックをテスト
npm run visual-test -- --block=carousel
npm run visual-test -- --block=hero

# 差分があれば、HTMLレポートをPRに添付
# または、GitHub Actionsでアーティファクトとしてアップロード
```

### Tip 3: 定期的なメンテナンス
```bash
# デザイン更新時は、計画的にベースライン更新
npm run visual-test -- --block=carousel --update-baseline
git add .visual-regression/baseline/
git commit -m "Update baselines after design refresh"
```

---

## 🚀 今後の拡張

- [ ] 全ブロック一括テスト
- [ ] 複数ビューポート並行テスト
- [ ] Slack通知統合
- [ ] PR Comment自動投稿
- [ ] 差分履歴トラッキング
- [ ] パフォーマンス最適化（並列実行）

---

## ❓ FAQ

**Q: Chromaticと併用できる？**  
A: はい。ローカルで事前チェック → Chromaticでチームレビューというフローが推奨。

**Q: ベースラインはいつ更新すべき？**  
A: 意図的なデザイン変更をした時のみ。意図しない変更は修正すべき。

**Q: CI/CDで使える？**  
A: はい。GitHub Actionsの例を参照。

**Q: 実行が遅い場合は？**  
A: Storybookをビルドモードで実行すると高速化します。

---

これで、**完全ローカル、セキュアなVisual Regression Testing**が実現します！🎨
