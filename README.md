# d2c - Design to Code (Figma × EDS Template)

**Figmaデザインと実装の整合性を担保し、フロントエンド不具合を撲滅するEDSテンプレート**

<!-- Code Sync enabled: Dark Alley (code-based editing) -->

[![Chromatic](https://img.shields.io/badge/Chromatic-Visual_Regression-orange)](https://www.chromatic.com/)
[![Storybook](https://img.shields.io/badge/Storybook-Component_Library-ff4785)](https://storybook.js.org/)
[![Adobe EDS](https://img.shields.io/badge/Adobe-Edge_Delivery_Services-red)](https://www.aem.live/)

---

## 🎯 このテンプレートの目的

1. **Figmaデザイン → EDS実装の自動化**
   - Figma MCP統合によるデザイン情報直接取得
   - Living Specification による正確なHTML構造生成
   - デザイントークン（CSS Custom Properties）の自動抽出

2. **Visual Regression Testing の2層戦略**
   - **Layer 1**: Storybook（コンポーネント単位）
   - **Layer 2**: Playwright（ページ全体）
   - PR作成時の自動VRテスト実行

3. **開発プロセス自動化**
   - GitHub ActionsによるCI/CD
   - Chromatic Baseline自動更新
   - PR Comment への結果自動投稿

---

## 🚀 クイックスタート

⚠️ **セキュリティ注意**: このテンプレートには外部AIサービス（Anthropic/OpenAI）との統合機能が含まれます。ビジネス利用の場合は、使用前にセキュリティポリシーへの準拠を確認してください。詳細: [Vision LLM Integration Guide](./docs/VISION-LLM-INTEGRATION.md)

### 5分でブロック生成

```bash
# 1. Figma URLを取得
# 2. Cursorで実行
@figma https://www.figma.com/design/FILE_ID/...?node-id=NODE_ID

Generate EDS Block for "Hero"

# 3. 完了！
```

詳細: **[Quick Start Guide](./docs/QUICKSTART.md)**

---

## 📚 ドキュメント

### 🎓 Getting Started
- **[ROADMAP](./ROADMAP.md)** - プロジェクトビジョン・ゴール
- **[Quick Start Guide](./docs/QUICKSTART.md)** - 5分でブロック生成
- **[CONTRIBUTING](./CONTRIBUTING.md)** - コントリビューションガイド

### 📖 Developer Guides
- **[Block Development Complete Guide](./docs/BLOCK-DEVELOPMENT.md)** - 完全開発ガイド
  - Living Specification抽出
  - Block生成（Figma/User Story/Living Spec）
  - Visual Regression Testing
  - トラブルシューティング
- **[Vision AI Enhanced Generation](./docs/VISION-AI-ENHANCED-GENERATION.md)** - 🆕 Vision AI統合
  - Figmaスクリーンショット解析でCSS生成精度向上
  - 透明度・配置・形状を正確に検出
  - Visual差異を50-60% → 10-15%に改善
  - **[Direct Generation Demo](./docs/VISION-AI-DIRECT-GENERATION-DEMO.md)** - ⚡ ダイレクト生成デモ（推奨）
    - 1ステップで完結（解析JSON不要）
    - 検出精度98%、作業時間半減
  - [Structured Analysis Demo](./docs/VISION-AI-DEMO-RESULTS.md) - 2ステップ解析版

### 📝 Content Creation
- **[Content Guidelines](./docs/CONTENT-GUIDELINES.md)** - コンテンツ作成ルール
  - 改行禁止ルール
  - テストコンテンツパターン

### 🔧 Configuration
- **[.cursorrules](./.cursorrules)** - Block生成ルール（AI参照）
- **[eds-spec-config.json](./eds-spec-config.json)** - Living Spec設定
- **[chromatic.config.json](./chromatic.config.json)** - Visual Regression設定

---

## 🏗️ プロジェクト構成

```
d2c/
├─ README.md                       # このファイル
├─ ROADMAP.md                      # ビジョン・ゴール
├─ .cursorrules                    # Block生成ルール
│
├─ docs/                           # ドキュメント
│  ├─ QUICKSTART.md                # 5分でブロック生成
│  ├─ BLOCK-DEVELOPMENT.md         # 完全開発ガイド
│  ├─ CONTENT-GUIDELINES.md        # コンテンツ作成ルール
│  └─ user-stories/                # User Storyサンプル
│     └─ hero-block.md
│
├─ blocks/                         # EDS Blocks実装
│  ├─ hero/
│  │  ├─ hero.js                   # Block実装
│  │  ├─ hero.css                  # スタイル
│  │  ├─ hero.stories.js           # Storybook Stories
│  │  └─ hero.eds-spec.json        # Living Specification
│  └─ ...
│
├─ scripts/                        # 自動化スクリプト
│  ├─ discover-living-spec.js      # Living Spec自動検出
│  ├─ extract-eds-specification.js # Living Spec抽出
│  └─ ...
│
├─ styles/                         # グローバルスタイル
│  └─ styles.css                   # デザイントークン（CSS Custom Properties）
│
├─ test-pages/                     # テストページ（Living Spec抽出用）
│  ├─ hero-test.md
│  └─ ...
│
├─ tests/                          # E2Eテスト
│  └─ chromatic.spec.js            # Playwright VRテスト
│
├─ .github/workflows/              # GitHub Actions
│  └─ chromatic-two-layer.yml      # 2層VRテスト
│
├─ config/                         # 設定ファイル
│  ├─ project.config.json          # 🆕 プロジェクト設定（要初期化）
│  ├─ project.config.schema.json   # JSON Schema
│  ├─ chromatic/                   # VRテスト設定
│  │  ├─ chromatic-pages.config.json
│  │  ├─ chromatic-pages.schema.json
│  │  └─ chromatic.config.json
│  ├─ component/                   # DarkAlley設定
│  │  ├─ component-definition.json
│  │  ├─ component-filters.json
│  │  └─ component-models.json
│  └─ figma/                       # Figma URL管理
│     └─ figma-urls.json
│
├─ .env.example                    # 🆕 環境変数テンプレート
├─ .env                            # 環境変数（gitignore）
├─ chromatic.config.js             # Playwright設定
└─ package.json                    # npm scripts
```

---

## 💡 主要機能

### 1. Figma MCP統合

Figmaデザインから直接情報を取得：
- コンポーネント構造・Variants
- デザイントークン（Variables）
- レイアウト・寸法
- インタラクション状態

```bash
@figma https://www.figma.com/design/FILE_ID/...?node-id=NODE_ID
Generate EDS Block
```

### 2. 自動Visual Validation（NEW!）

**Figma デザインと Storybook 実装を自動比較・修正**：

```bash
# Block生成後、自動的に実行される
npm run validate-block -- --block=hero --node-id=2-1446 --demo
```

**処理フロー**:
1. ✅ Figma API から正確な CSS プロパティ取得
2. ✅ Storybook の実装をキャプチャ
3. ✅ スタイル差異を自動検出
4. ✅ CSS を自動修正してFigmaに一致させる
5. ✅ ホットリロード後に再検証
6. ✅ 一致するまで自動的に繰り返し（最大5回）

**デモ出力例**:
```
📍 Iteration 1/5
📥 Fetching Figma styles...
📸 Capturing Storybook...
🔍 Comparing styles...
⚠️  Found 3 difference(s):
   ❌ backgroundColor:
      Figma:     "rgb(26, 73, 137)"
      Storybook: "rgb(255, 255, 255)"
   ❌ fontSize:
      Figma:     "48px"
      Storybook: "32px"
🔧 Applying 3 fixes to hero.css...
✅ Fixes applied
⏳ Waiting for hot reload...

📍 Iteration 2/5
✅ All styles match! 🎉
```

### 3. Living Specification

EDS環境から正確なHTML構造を抽出：

```bash
# 自動検出
npm run discover-spec -- hero

# 手動指定
npm run extract-eds-spec -- hero /test-pages/hero-test
```

### 3. Living Specification

EDS環境から正確なHTML構造を抽出：

```bash
# 自動検出
npm run discover-spec -- hero

# 手動指定
npm run extract-eds-spec -- hero /test-pages/hero-test
```

生成: `blocks/hero/hero.eds-spec.json`

### 4. Visual Regression Testing (2層戦略)

#### Layer 1: Storybook (Component Level)
```bash
npm run chromatic:storybook
```
- 変更されたBlockのみテスト
- TurboSnap自動検出

### 4. Visual Regression Testing (2層戦略)

#### Layer 1: Storybook (Component Level)
```bash
npm run chromatic:storybook
```
- 変更されたBlockのみテスト
- TurboSnap自動検出

#### Layer 2: Playwright (E2E Level)
```bash
npm run chromatic:playwright
```
- 設定ファイル管理の全ページテスト
- `config/chromatic/chromatic-pages.config.json`で対象ページ管理

### 5. GitHub Actions自動化

PR作成時に自動実行：
- ✅ 2層Visual Regression Test
- ✅ PR CommentにChromatic Build URL投稿
- ✅ PR merge時にBaseline自動更新

---

## 🔧 セットアップ

### 新規プロジェクトとして使う場合

```bash
# 1. このリポジトリをテンプレートとしてクローン
git clone https://github.com/daichimurata/d2c.git my-new-project
cd my-new-project

# 2. 依存パッケージインストール
npm install

# 3. プロジェクト初期化（対話形式）
npm run init-project
# ↓ プロジェクト名、GitHub情報、Figma情報を入力

# 4. ローカル開発環境設定
cp .env.example .env
# .env を編集して Figma Personal Access Token を追加

# 5. GitHub リポジトリ作成＆プッシュ
git add .
git commit -m "Initialize project"
git remote set-url origin https://github.com/your-org/your-project.git
git push -u origin main

# 6. GitHub Secrets/Variables を設定
# Settings > Secrets and variables > Actions
# - Secrets: CHROMATIC_STORYBOOK_TOKEN, CHROMATIC_PLAYWRIGHT_TOKEN
# - Variables: CHROMATIC_STORYBOOK_APP_ID, CHROMATIC_PLAYWRIGHT_APP_ID

# 7. 開発開始！
npm run storybook
```

### 前提条件

- Node.js 20+
- Figma Personal Access Token (PAT)

### 環境変数設定

#### ローカル開発（.env ファイル）

```bash
# .env
FIGMA_PERSONAL_ACCESS_TOKEN=figd_xxxxxxxxxxxxx
```

📖 トークン取得: https://www.figma.com/developers/api#access-tokens

#### GitHub Settings

**Secrets** (Settings > Secrets and variables > Actions > Secrets):
- `CHROMATIC_STORYBOOK_TOKEN` - Chromatic Storybook用トークン
- `CHROMATIC_PLAYWRIGHT_TOKEN` - Chromatic Playwright用トークン

**Variables** (Settings > Secrets and variables > Actions > Variables):
- `CHROMATIC_STORYBOOK_APP_ID` - Chromatic Storybook App ID
- `CHROMATIC_PLAYWRIGHT_APP_ID` - Chromatic Playwright App ID

📖 Chromatic: https://www.chromatic.com/start

### GitHub Actions自動化

PR作成時に自動実行：
- ✅ 2層Visual Regression Test
- ✅ PR CommentにChromatic Build URL投稿
- ✅ PR merge時にBaseline自動更新

---

## 🚀 使い方

### Block生成（完全自動フロー）

```bash
# 1. Cursorで実行
@figma https://www.figma.com/design/FILE_ID/...?node-id=NODE_ID
Generate EDS Block for "Hero"

# 2. AIが自動実行:
#    - Block コード生成 (JS/CSS/Stories)
#    - Storybook 起動確認
#    - Visual Validation ループ実行
#    - Figma と完全一致するまで CSS 自動修正

# 3. 完了！Figmaデザインと完全一致
```

### 手動Visual Validation（必要に応じて）

```bash
# Storybook起動
npm run storybook

# 別ターミナルで検証実行
npm run validate-block -- --block=hero --node-id=2-1446 --demo
```

---

## 🎬 使い方（旧フロー - 参考）

### Block生成（推奨フロー）

```bash
# 1. DarkAlleyでコンテンツ作成 → Deploy

# 2. Living Specification抽出
npm run discover-spec -- hero

# 3. Block生成（Cursor）
@figma https://www.figma.com/design/FILE_ID/...?node-id=NODE_ID
@file blocks/hero/hero.eds-spec.json
Generate EDS Block

# 4. Storybook確認
npm run storybook

# 5. ローカルEDS確認
npm run aem:up

# 6. PR作成 → 自動VRテスト
```

---

## 🌐 Environments

- **Preview**: https://main--d2c--daichimurata.aem.page/
- **Live**: https://main--d2c--daichimurata.aem.live/
- **Storybook**: Local (http://localhost:6006)
- **Local EDS**: Local (http://localhost:3000)

---

## 📊 品質指標

- ✅ **Lighthouse Score**: 100/100 目標
- ✅ **Accessibility**: WCAG AA準拠
- ✅ **Visual Regression**: Chromatic 2層テスト
- ✅ **Design Fidelity**: Figma 100%一致

---

## 🔗 参考リンク

### Adobe EDS
- [EDS Documentation](https://www.aem.live/docs/)
- [Developer Tutorial](https://www.aem.live/developer/tutorial)
- [EDS Block Collection](https://github.com/adobe/aem-block-collection)

### Tools
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Documentation](https://storybook.js.org/docs/)
- [Playwright Documentation](https://playwright.dev/)

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 License

See [LICENSE](./LICENSE)

---

## 🆘 Support

問題が発生した場合:
1. [Troubleshooting Guide](./docs/BLOCK-DEVELOPMENT.md#troubleshooting)
2. [GitHub Issues](https://github.com/daichimurata/d2c/issues)

---

**Built with ❤️ for Design-to-Code automation**
