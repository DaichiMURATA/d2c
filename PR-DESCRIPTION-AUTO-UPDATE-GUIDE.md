# PR Description Auto-Update Guide

## 📋 概要

このプロジェクトでは、PR 作成時に自動的に **AEM.live Preview URL** を Description に挿入する仕組みを実装しています。

これにより、`aem-psi-check` が必要とする **test URL** が自動的に PR Description に含まれるようになり、エラーを回避できます。

---

## 🎯 目的

### 解決する課題

Adobe Boilerplate の `aem-psi-check` は、PR Description に **test URL** が含まれていることを期待しています。

**エラー例:**
```
aem-psi-check — Rejected: provide test url
```

### 解決方法

1. **Pull Request テンプレート** (`.github/pull_request_template.md`)
   - PR 作成時に自動的に読み込まれる
   - プレースホルダー `{{BRANCH_NAME}}` を含む

2. **自動更新ワークフロー** (`.github/workflows/auto-pr-description.yml`)
   - PR 作成時に自動実行
   - ブランチ名から AEM.live URL を生成
   - Description 内のプレースホルダーを実際の URL に置き換え
   - PR コメントにも Preview URL を追加

---

## 🚀 使い方

### パターン 1: GitHub UI から PR を作成

1. GitHub の UI で "New Pull Request" をクリック
2. テンプレートが自動的に読み込まれる（プレースホルダー付き）:

```markdown
## 🔗 Preview URLs

**Source Branch Preview:**
- https://{{BRANCH_NAME}}--d2c--daichimurata.aem.live/

**Target Branch Preview (develop):**
- https://develop--d2c--daichimurata.aem.live/
```

3. "Create Pull Request" をクリック
4. **自動的に** `{{BRANCH_NAME}}` が実際のブランチ名に置き換えられる:

```markdown
## 🔗 Preview URLs

**Source Branch Preview:**
- https://feature-new-block--d2c--daichimurata.aem.live/

**Target Branch Preview (develop):**
- https://develop--d2c--daichimurata.aem.live/
```

5. PR コメントにも Preview URL が追加される

---

### パターン 2: GitHub CLI から PR を作成

```bash
# オプション A: テンプレートを使用（推奨）
gh pr create --title "feat: Add new block" --base develop --web

# オプション B: 直接 URL を指定
gh pr create \
  --title "feat: Add new block" \
  --body "Test URL: https://$(git branch --show-current)--d2c--daichimurata.aem.live/" \
  --base develop
```

**注意:** GitHub CLI を使用する場合でも、PR 作成後に自動更新ワークフローが実行されます。

---

### パターン 3: 手動で作成された PR（テンプレートなし）

もし PR が手動で作成され、テンプレートが使用されなかった場合でも、自動更新ワークフローが Preview URL セクションを追加します。

**Before (手動で作成された PR):**
```markdown
## 変更内容
新しいブロックを追加
```

**After (自動更新後):**
```markdown
## 変更内容
新しいブロックを追加

## 🔗 Preview URLs

**Source Branch Preview (feature-new-block):**
- https://feature-new-block--d2c--daichimurata.aem.live/

**Target Branch Preview (develop):**
- https://develop--d2c--daichimurata.aem.live/
```

---

## 🔧 仕組み

### 1. Pull Request テンプレート

**ファイル:** `.github/pull_request_template.md`

```markdown
## 🔗 Preview URLs

**Source Branch Preview:**
- https://{{BRANCH_NAME}}--d2c--daichimurata.aem.live/
```

- `{{BRANCH_NAME}}` がプレースホルダー
- PR 作成時に GitHub UI に自動表示される

---

### 2. 自動更新ワークフロー

**ファイル:** `.github/workflows/auto-pr-description.yml`

**トリガー:**
- `pull_request` イベント
- `types: [opened, reopened]`

**処理フロー:**

```
1. PR が作成される
   ↓
2. ブランチ名を取得
   例: feature-new-block
   ↓
3. AEM.live URL を生成
   Source: https://feature-new-block--d2c--daichimurata.aem.live/
   Target: https://develop--d2c--daichimurata.aem.live/
   ↓
4. PR Description を更新
   {{BRANCH_NAME}} → feature-new-block
   ↓
5. PR コメントを追加
   Preview URL を表形式で表示
```

---

## 📝 URL 生成ルール

### AEM.live URL パターン

```
https://{branch}--{repo}--{owner}.aem.live/
```

### 例

| ブランチ名 | 生成される URL |
|-----------|---------------|
| `feature-hero` | `https://feature-hero--d2c--daichimurata.aem.live/` |
| `fix-cards` | `https://fix-cards--d2c--daichimurata.aem.live/` |
| `develop` | `https://develop--d2c--daichimurata.aem.live/` |
| `main` | `https://main--d2c--daichimurata.aem.live/` |

### 注意事項

**ブランチ名の文字数制限:**
- DNS ホスト名のラベル制限: 63文字
- `{branch}--d2c--daichimurata` の合計が 63文字以内である必要がある
- `d2c--daichimurata` = 18文字
- **ブランチ名は 43文字以内を推奨**

**推奨されるブランチ名:**
- ✅ `feature-hero` (短い)
- ✅ `fix-cards-layout` (適度)
- ⚠️ `feature-implement-new-accordion-block-with-animations` (長すぎる)

---

## 🎨 PR コメント例

自動更新ワークフローは、PR Description の更新に加えて、以下のようなコメントを PR に追加します：

```markdown
## 🔗 Preview URLs

Your changes have been deployed to AEM.live!

| Branch | Preview URL |
|--------|-------------|
| **feature-hero** (Source) | https://feature-hero--d2c--daichimurata.aem.live/ |
| **develop** (Target) | https://develop--d2c--daichimurata.aem.live/ |

### 🚀 Quick Links
- [View Source Preview](https://feature-hero--d2c--daichimurata.aem.live/)
- [View Target Preview](https://develop--d2c--daichimurata.aem.live/)

---
*Preview URLs are automatically generated from the branch name.*
```

---

## 🛠️ カスタマイズ

### リポジトリ名や Owner を変更する場合

**ファイル:** `.github/workflows/auto-pr-description.yml`

```yaml
# 修正箇所
SOURCE_URL="https://${BRANCH_NAME}--YOUR_REPO--YOUR_OWNER.aem.live/"
TARGET_URL="https://${TARGET_BRANCH}--YOUR_REPO--YOUR_OWNER.aem.live/"
```

**ファイル:** `.github/pull_request_template.md`

```markdown
**Source Branch Preview:**
- https://{{BRANCH_NAME}}--YOUR_REPO--YOUR_OWNER.aem.live/
```

### デフォルトブランチを変更する場合

現在は `develop` をターゲットブランチとしていますが、`main` に変更する場合：

**ファイル:** `.github/pull_request_template.md`

```markdown
**Target Branch Preview (main):**
- https://main--d2c--daichimurata.aem.live/
```

---

## ✅ 動作確認

### 正常に動作しているか確認する方法

1. **テスト用 PR を作成:**

```bash
git checkout -b test-pr-template
git commit --allow-empty -m "test: PR template test"
git push origin test-pr-template
gh pr create --title "test: PR template" --base develop --web
```

2. **確認ポイント:**

   ✅ PR Description に Preview URL が含まれている
   ✅ `{{BRANCH_NAME}}` が実際のブランチ名に置き換えられている
   ✅ PR コメントに Preview URL が追加されている
   ✅ `aem-psi-check` がエラーを出さない

3. **テスト PR をクローズ:**

```bash
gh pr close test-pr-template
git checkout develop
git branch -D test-pr-template
git push origin --delete test-pr-template
```

---

## 🐛 トラブルシューティング

### 問題 1: `{{BRANCH_NAME}}` が置き換えられない

**原因:** GitHub Actions ワークフローが実行されていない

**解決策:**
1. `.github/workflows/auto-pr-description.yml` が `main` or `develop` にマージされているか確認
2. GitHub Actions の権限設定を確認:
   - Settings → Actions → General → Workflow permissions
   - "Read and write permissions" を有効化

---

### 問題 2: `aem-psi-check` が依然としてエラーを出す

**原因:** URL の形式が PSI Check の期待と異なる

**解決策:**
PSI Check は以下の形式を期待しています:
```
Test URL: https://...
```

または:
```
- https://...
```

テンプレートは既にこの形式に対応していますが、もし問題が続く場合は、Description に以下を追加:

```markdown
Test URL: https://YOUR_BRANCH--d2c--daichimurata.aem.live/
```

---

### 問題 3: PR コメントが追加されない

**原因:** GitHub Token の権限不足

**解決策:**
`.github/workflows/auto-pr-description.yml` の `permissions` セクションを確認:

```yaml
permissions:
  pull-requests: write  # ← これが必要
  contents: read
```

---

## 📚 関連ファイル

| ファイル | 役割 |
|---------|------|
| `.github/pull_request_template.md` | PR テンプレート（プレースホルダー付き） |
| `.github/workflows/auto-pr-description.yml` | 自動更新ワークフロー |
| `PR-DESCRIPTION-AUTO-UPDATE-GUIDE.md` | このガイド |

---

## 🎉 まとめ

### Before (手動で URL を入力)

```markdown
Test URL: https://feature-hero--d2c--daichimurata.aem.live/
              ↑
        毎回手入力が必要、ブランチ名の typo リスク
```

### After (自動生成)

```markdown
**Source Branch Preview:**
- https://feature-hero--d2c--daichimurata.aem.live/
              ↑
        自動的にブランチ名から生成、typo なし
```

### メリット

✅ **自動化:** ブランチ名から自動的に URL を生成  
✅ **エラー削減:** typo や入力ミスを防止  
✅ **一貫性:** すべての PR で同じ形式の URL  
✅ **PSI Check 対応:** `aem-psi-check` のエラーを自動回避  
✅ **開発者体験向上:** 手動入力の手間を削減

---

## 📖 参考リンク

- [GitHub Actions - Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [GitHub Actions - Using scripts](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun)
- [AEM.live URL Patterns](https://www.aem.live/docs/setup-byo-cdn-cloudflare-worker#branch-deployments)
