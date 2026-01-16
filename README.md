# d2c - Design to Code (Figma × EDS Template)

**Figmaデザインと実装の整合性を担保し、フロントエンド不具合を撲滅するEDSテンプレート**

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
├─ eds-spec-config.json            # Living Spec設定
├─ chromatic.config.json           # Chromatic設定
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

### 2. Living Specification

EDS環境から正確なHTML構造を抽出：

```bash
# 自動検出
npm run discover-spec -- hero

# 手動指定
npm run extract-eds-spec -- hero /test-pages/hero-test
```

生成: `blocks/hero/hero.eds-spec.json`

### 3. Visual Regression Testing (2層戦略)

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
- `chromatic-pages.config.json`で対象ページ管理

### 4. GitHub Actions自動化

PR作成時に自動実行：
- ✅ 2層Visual Regression Test
- ✅ PR CommentにChromatic Build URL投稿
- ✅ PR merge時にBaseline自動更新

---

## 🔧 セットアップ

### 前提条件

- Node.js 20+
- Figma Personal Access Token (PAT)

### インストール

```bash
# リポジトリクローン
git clone https://github.com/daichimurata/d2c.git
cd d2c

# 依存パッケージインストール
npm install

# Figma PAT設定
export FIGMA_PERSONAL_ACCESS_TOKEN=figd_your_token_here

# AEM CLI インストール（ローカル開発用）
npm install -g @adobe/aem-cli
```

### GitHub Secrets設定

```bash
CHROMATIC_STORYBOOK_PROJECT_TOKEN=project-token-xxx
CHROMATIC_PLAYWRIGHT_PROJECT_TOKEN=project-token-yyy
```

### GitHub Variables設定

```bash
CHROMATIC_STORYBOOK_APP_ID=your-storybook-app-id
CHROMATIC_PLAYWRIGHT_APP_ID=your-playwright-app-id
```

---

## 🎬 使い方

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
