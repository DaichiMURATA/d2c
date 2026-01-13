# Chromatic Playwright セットアップガイド

このガイドは、Layer 2（Playwright E2E）のChromatic Playwrightプロジェクトをセットアップする手順です。

---

## 📋 前提条件

- ✅ Chromatic Storybookプロジェクト（Layer 1）が既にセットアップ済み
- ✅ GitHub Secretsに `CHROMATIC_STORYBOOK_TOKEN` と `CHROMATIC_STORYBOOK_APP_ID` が設定済み

---

## 🎯 セットアップ手順

### ステップ1: Chromatic Playwrightプロジェクトを作成

1. [Chromatic](https://www.chromatic.com/)にアクセス
2. **Create new project** をクリック
3. プロジェクトタイプとして **Playwright** を選択
4. GitHubリポジトリと連携
5. **Project Token** と **App ID** を取得

---

### ステップ2: ローカルで初回パブリッシュ

環境変数を設定して、Playwrightテストを実行し、Chromaticにアップロードします。

```bash
cd /Users/dmurata/Documents/Dev/figma-design-to-eds-code

# 環境変数を設定
export CHROMATIC_PLAYWRIGHT_TOKEN="chpt_YYYYYYYYYYYY"

# Playwrightテストを実行
SOURCE_URL=https://main--figma-design-to-eds-code--daichimurata.aem.live npm run test:chromatic

# Chromaticにアップロード
npm run chromatic:playwright
```

---

### ステップ3: GitHub Secretsを設定

1. GitHub リポジトリ → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** をクリック
3. 以下の2つを追加:

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `CHROMATIC_PLAYWRIGHT_TOKEN` | `chpt_YYYYYYYYYYYY` | Chromatic Playwrightプロジェクトのトークン |
| `CHROMATIC_PLAYWRIGHT_APP_ID` | `ZZZZZZZZZZZZZZZZZZZZZZZZ` | Chromatic PlaywrightのApp ID |

---

### ステップ4: テストPRで動作確認

```bash
# テストブランチを作成
git checkout -b test/chromatic-playwright-setup

# 何か変更（例: README.mdを編集）
echo "Test Chromatic Playwright integration" >> README.md

# コミット・プッシュ
git add README.md
git commit -m "test: Verify Chromatic Playwright integration"
git push origin test/chromatic-playwright-setup
```

GitHub でPRを作成すると、以下が自動実行されます：

1. **Layer 1（Storybook）**: 変更のあったBlockのStorybookをテスト
2. **Layer 2（Playwright）**: TOPページのE2Eをテスト
3. **PRコメント**: 両方のChromatic Build URLが表示

---

## 📊 期待される結果

PR作成後、GitHub ActionsのPRコメントに以下のように表示されます：

```
## 🎨 Chromatic Two-Layer Visual Testing Results

### Layer 1: Storybook Component Testing (Changed Blocks Only)
✅ **Passed** - Changed block stories tested
- 🔗 [View Chromatic Build #XX →](https://www.chromatic.com/build?appId=6965e28bb8aed8fda40a26ff&number=XX)
- Stories tested: 37
- ⚡ Only changed blocks are tested for efficiency

### Layer 2: Playwright E2E Page Testing (Config-Based)
✅ **Passed** - E2E pages tested
- 🔗 [View Chromatic Build #YY →](https://www.chromatic.com/build?appId=ZZZZZZZZZZZZZZZZZZZZZZZZ&number=YY)
- Screenshots captured and available in artifacts
- 📄 Test pages defined in `chromatic-pages.config.json`
- Source: `test/chromatic-playwright-setup`
- Target: `main`
```

---

## 🔧 トラブルシューティング

### ❌ `CHROMATIC_PLAYWRIGHT_TOKEN` が見つからない

**原因**: GitHub Secretsが未設定  
**解決**: 上記の「GitHub Secretsを設定」を実施

### ❌ Playwright E2Eテストがタイムアウト

**原因**: EDS URLがまだデプロイされていない  
**解決**: ブランチをプッシュしてから5-10分待つ

### ❌ Chromatic Build（Playwright）が表示されない

**原因**: App IDが未設定または間違っている  
**解決**: `CHROMATIC_PLAYWRIGHT_APP_ID` Secretを確認・追加

### ❌ テスト結果が Chromatic にアップロードされない

**原因**: Playwrightテストが失敗している  
**解決**:
```bash
# ローカルでテスト実行
SOURCE_URL=https://main--figma-design-to-eds-code--daichimurata.aem.live npm run test:chromatic

# テスト結果を確認
cat test-results/chromatic.spec.js-results.xml
```

---

## 📝 テスト対象ページの管理

Layer 2のテスト対象ページは `chromatic-pages.config.json` で管理されます。

デフォルトはTOPページのみですが、ページを追加できます：

```json
{
  "baseUrl": "https://main--figma-design-to-eds-code--daichimurata.aem.live",
  "pages": [
    {
      "name": "homepage",
      "path": "/",
      "viewports": [
        { "name": "desktop", "width": 1200, "height": 800 },
        { "name": "mobile", "width": 375, "height": 667 }
      ]
    },
    {
      "name": "about",
      "path": "/about",
      "viewports": [
        { "name": "desktop", "width": 1200, "height": 800 }
      ]
    }
  ]
}
```

詳細は [CHROMATIC-PAGES-CONFIG.md](./CHROMATIC-PAGES-CONFIG.md) を参照してください。

---

## ✅ セットアップ完了チェックリスト

- [ ] Chromatic Playwrightプロジェクトを作成
- [ ] `CHROMATIC_PLAYWRIGHT_TOKEN` Secretを設定
- [ ] `CHROMATIC_PLAYWRIGHT_APP_ID` Secretを設定
- [ ] ローカルで初回パブリッシュ完了
- [ ] テストPRを作成して動作確認
- [ ] PRコメントに両方のChromatic Build URLが表示されることを確認
- [ ] Playwrightダッシュボードでビジュアル差分を確認
- [ ] Baselineを承認

---

## 🎉 完了！

両方のChromatic プロジェクト（Storybook & Playwright）が正常に動作したら、Visual Regression Testingの運用開始です！

- **Layer 1**: 変更のあったBlockのStorybookのみテスト（コスト効率的）
- **Layer 2**: TOPページのE2Eテスト（設定ファイルベース）

PRを作成するたびに、自動的に両方のレイヤーがテストされ、ビジュアル差分が検出されます。🚀
