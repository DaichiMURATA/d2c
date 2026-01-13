# Chromatic セットアップガイド

このプロジェクトでは、Chromaticを使用したTwo-Layer Visual Regression Testingを実装しています。

## 📋 必要な設定

### 1. Chromaticプロジェクトの作成

1. [Chromatic](https://www.chromatic.com/)にサインアップ
2. 新しいプロジェクトを作成
3. GitHubリポジトリと連携
4. **Project Token**と**App ID**を取得

---

### 2. GitHub Secretsの設定

リポジトリの設定で以下のSecretsを追加してください：

#### 設定手順:
1. GitHub リポジトリ → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** をクリック
3. 以下の4つを追加:

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `CHROMATIC_STORYBOOK_TOKEN` | `chpt_XXXXXXXXXXXX` | Chromatic Storybookプロジェクトのトークン |
| `CHROMATIC_STORYBOOK_APP_ID` | `69606830af12af0596be2ea1` | Chromatic StorybookのApp ID |
| `CHROMATIC_PLAYWRIGHT_TOKEN` | `chpt_YYYYYYYYYYYY` | Chromatic Playwrightプロジェクトのトークン |
| `CHROMATIC_PLAYWRIGHT_APP_ID` | `ZZZZZZZZZZZZZZZZZZZZZZZZ` | Chromatic PlaywrightのApp ID |

#### プロジェクト構成:
- **Storybook プロジェクト**: ブロックコンポーネントのビジュアルテスト（Layer 1）
- **Playwright プロジェクト**: E2Eページテスト（Layer 2）

#### Tokenの取得方法:
1. **Storybookプロジェクト**: 
   - Chromatic Dashboard → プロジェクト選択 → **Manage** → **Configure** → **Project token**をコピー
   
2. **Playwrightプロジェクト**: 
   - Chromaticで新しいプロジェクトを作成（プロジェクトタイプ: **Playwright**）
   - **Manage** → **Configure** → **Project token**をコピー

#### App IDの取得方法:
- Chromatic DashboardのURLから取得: `https://www.chromatic.com/builds?appId=XXXXX`

---

### 3. ローカルでの動作確認（オプション）

GitHub Secretsを設定する前に、ローカルでテストすることもできます：

#### Storybookプロジェクト（Layer 1）:
```bash
# 環境変数を設定
export CHROMATIC_STORYBOOK_TOKEN="chpt_XXXXXXXXXXXX"

# Storybookをビルド＆アップロード
npm run build-storybook
npm run chromatic:storybook
```

#### Playwrightプロジェクト（Layer 2）:
```bash
# 環境変数を設定
export CHROMATIC_PLAYWRIGHT_TOKEN="chpt_YYYYYYYYYYYY"

# Playwright E2Eテスト＆アップロード
SOURCE_URL=https://main--figma-design-to-eds-code--daichimurata.aem.live npm run test:chromatic
npm run chromatic:playwright
```

---

## 🎯 ワークフローの動作

### トリガー

1. **PRが作成された時**: 自動的に両方のレイヤーをテスト
2. **手動実行**: GitHub Actions → **Chromatic Two-Layer Visual Testing** → **Run workflow**

### Two-Layer Testing

#### **Layer 1: Storybook Component Testing（変更のあったBlockのみ）**
- Storybookで定義された全てのコンポーネントをテスト
- ブロック単位での細かいビジュアル確認
- **変更のあったブロックのみをテスト**（`onlyChanged: true`）
- コスト効率的な差分検出

#### **Layer 2: Playwright E2E Page Testing（設定ファイルベース）**
- `chromatic-pages.config.json` で定義されたページのみをテスト
- デフォルトはTOPページのみ（Desktop & Mobile）
- 必要に応じてページを追加可能

---

## 📄 テスト対象ページの管理

### chromatic-pages.config.json

Layer 2のテスト対象ページは `chromatic-pages.config.json` で管理されます。

#### デフォルト設定（TOPページのみ）:

```json
{
  "baseUrl": "https://main--figma-design-to-eds-code--daichimurata.aem.live",
  "pages": [
    {
      "name": "homepage",
      "path": "/",
      "viewports": [
        {
          "name": "desktop",
          "width": 1200,
          "height": 800
        },
        {
          "name": "mobile",
          "width": 375,
          "height": 667
        }
      ],
      "waitForNetworkIdle": true,
      "additionalWaitTime": 2000
    }
  ]
}
```

#### ページを追加する例:

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
      ],
      "waitForNetworkIdle": true,
      "additionalWaitTime": 2000
    },
    {
      "name": "about",
      "path": "/about",
      "viewports": [
        { "name": "desktop", "width": 1200, "height": 800 }
      ],
      "waitForNetworkIdle": true,
      "additionalWaitTime": 1000
    },
    {
      "name": "products",
      "path": "/products",
      "viewports": [
        { "name": "tablet", "width": 768, "height": 1024 }
      ],
      "waitForNetworkIdle": false,
      "additionalWaitTime": 3000
    }
  ]
}
```

#### 設定項目:

| 項目 | 説明 | 必須 |
|------|------|------|
| `name` | ページの識別名 | ✅ |
| `path` | URLパス（baseUrlからの相対パス） | ✅ |
| `viewports` | テストするビューポートのリスト | ✅ |
| `viewports[].name` | ビューポート名 | ✅ |
| `viewports[].width` | 幅（px） | ✅ |
| `viewports[].height` | 高さ（px） | ✅ |
| `waitForNetworkIdle` | ネットワークアイドル待機 | ❌ (default: true) |
| `additionalWaitTime` | 追加待機時間（ms） | ❌ (default: 2000) |

---

## 📊 結果の確認

### PRコメント

PR作成後、GitHub Actionsが自動的に以下のコメントを追加します：

```
## 🎨 Chromatic Two-Layer Visual Testing Results

### Layer 1: Storybook Component Testing
✅ **Passed** - Component stories tested
- 🔗 [View Chromatic Build #XX →](https://www.chromatic.com/build?appId=XXX&number=XX)
- Stories tested: 42

### Layer 2: Playwright E2E Page Testing
✅ **Passed** - E2E pages tested
- 🔗 [View Chromatic Build #YY →](https://www.chromatic.com/build?appId=XXX&number=YY)
- Source: `feature-branch`
- Target: `main`
```

### Chromaticダッシュボード

1. PRコメント内のリンクをクリック
2. ビジュアル差分を確認
3. **Accept** または **Deny** で承認/却下

---

## 🔧 トラブルシューティング

### ❌ `CHROMATIC_STORYBOOK_TOKEN` または `CHROMATIC_PLAYWRIGHT_TOKEN` が見つからない

**原因**: GitHub Secretsが未設定  
**解決**: 上記の「GitHub Secretsの設定」を実施

### ❌ Storybookのビルドが失敗

**原因**: Storybook依存関係の不足  
**解決**:
```bash
npm ci
npm run build-storybook
```

### ❌ Playwright E2Eテストがタイムアウト

**原因**: EDS URLがまだデプロイされていない  
**解決**: ブランチをプッシュしてから5-10分待つ

### ❌ Chromatic Buildが表示されない

**原因**: App IDが未設定  
**解決**: `CHROMATIC_STORYBOOK_APP_ID` と `CHROMATIC_PLAYWRIGHT_APP_ID` Secretを追加

---

## 📚 参考リンク

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Chromatic + Storybook](https://www.chromatic.com/docs/storybook)
- [Chromatic + Playwright](https://www.chromatic.com/docs/playwright)
- [GitHub Actions](https://docs.github.com/en/actions)
- [AEM Edge Delivery Services](https://www.aem.live/docs/)

---

## ✅ セットアップ完了チェックリスト

### Storybookプロジェクト（Layer 1）
- [ ] Chromatic Storybookプロジェクトを作成
- [ ] `CHROMATIC_STORYBOOK_TOKEN` Secretを設定
- [ ] `CHROMATIC_STORYBOOK_APP_ID` Secretを設定
- [ ] ローカルで初回パブリッシュ完了

### Playwrightプロジェクト（Layer 2）
- [ ] Chromatic Playwrightプロジェクトを作成
- [ ] `CHROMATIC_PLAYWRIGHT_TOKEN` Secretを設定
- [ ] `CHROMATIC_PLAYWRIGHT_APP_ID` Secretを設定
- [ ] ローカルで初回パブリッシュ完了

### 動作確認
- [ ] テストPRを作成して動作確認
- [ ] Chromaticダッシュボード（Storybook）でビジュアル差分を確認
- [ ] Chromaticダッシュボード（Playwright）でビジュアル差分を確認
- [ ] Baselineを承認

セットアップが完了したら、このチェックリストを完了し、Visual Regression Testingを運用に乗せましょう！🎉
