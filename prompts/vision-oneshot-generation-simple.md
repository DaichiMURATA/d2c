# Vision AI One-Shot Block Generation Prompt

**シンプルなプロンプトで完結します。**

---

## 🚀 使い方

### Cursor Composer (Cmd+I) に以下をコピー＆ペースト：

```
Carouselブロックを生成してください。

Figma: https://www.figma.com/design/MJTwyRbE5EVdlci3UIwsut/SandBox-0108-AEM-Figma-Design-Framework?node-id=9392-122
```

**これだけです！** AIが自動的に`.cursorrules`のワークフローに従います。

---

## 📝 他のブロックを生成する場合

**Hero**:
```
Heroブロックを生成してください。

Figma: https://www.figma.com/design/MJTwyRbE5EVdlci3UIwsut/SandBox-0108-AEM-Figma-Design-Framework?node-id=8668-503
```

**Cards**:
```
Cardsブロックを生成してください。

Figma: https://www.figma.com/design/MJTwyRbE5EVdlci3UIwsut/SandBox-0108-AEM-Figma-Design-Framework?node-id=531-54
```

---

## ⚙️ AIが自動実行すること

AIは `.cursorrules` のワークフローに従って、以下を自動実行します：

1. ✅ `config/figma/figma-urls.json` から全Variantを取得
2. ✅ 各Variantのスクリーンショットをキャプチャ
3. ✅ Figma画像アセットをダウンロード
4. ✅ スクリーンショットから視覚的詳細を解析（Vision AI）
5. ✅ CSS/JS/Stories を生成（全Variant対応）
6. ✅ 全Variantを検証
7. ✅ 結果をレポート

---

## 🎯 期待される結果

- **{block}.css**: 視覚的詳細を反映したスタイル
- **{block}.js**: EDS構造に従った完全なロジック
- **{block}.stories.js**: 全Figma Variantに対応したStories
- **検証レポート**: 各Variantの視覚的差異レポート

---

## 💡 ポイント

- **プロンプトはシンプル**: 「{ブロック名}を生成してください」だけでOK
- **Figma URLを添える**: Component Set のURLを提供
- **手動作業なし**: AI が全ての技術的な手順を自動実行
- **全Variant対応**: 自動的に全Variantのスクリーンショット取得＆Story生成

---

## 📚 詳細ドキュメント

- `.cursorrules` - AI自動ワークフロー（超簡潔版）
- `docs/CURSORRULES-DETAILED.md` - 詳細な技術仕様
- `docs/VISION-AI-ENHANCED-GENERATION.md` - Vision AI生成の詳細
- `config/figma/figma-urls.json` - Figma Variant定義

