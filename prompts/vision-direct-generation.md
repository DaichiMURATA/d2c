# Vision AI Direct Generation Prompt

このプロンプトをCursor Composer/Chatで使用して、Figmaスクリーンショットから**直接**CSS/HTMLを生成します（中間の解析JSONステップなし）。

---

## 🎯 目的

Figma Variantのスクリーンショットを見て、視覚的に一致するCSS/HTMLを直接生成する。

---

## 📋 使い方

### Step 1: スクリーンショット取得

```bash
npm run capture-figma-variant -- --block=carousel --node-id=9392:204
```

**出力**: `blocks/carousel/figma-variant-9392-204.png`

### Step 2: Cursorで生成指示（このプロンプト使用）

1. Cursor Composer (Cmd+I) を開く
2. `blocks/carousel/figma-variant-9392-204.png` を添付
3. 以下のプロンプトを実行 → 完了！

---

## 🔍 生成プロンプト（Cursor用）

```
以下のFigma Carouselコンポーネントのスクリーンショットを見て、
視覚的に一致するCSS/HTMLを生成してください。

# 添付画像
blocks/carousel/figma-variant-9392-204.png

# 指示

## 1. 現在のファイルを確認
- blocks/carousel/carousel.css
- blocks/carousel/carousel.js
- blocks/carousel/carousel.stories.js

これらのファイルを読み込んで、既存の実装を理解してください。

## 2. 視覚的詳細を正確に反映

画像から以下を読み取り、CSSに反映してください：

### 背景・オーバーレイ
- 背景画像の有無と配置
- 暗いオーバーレイの有無と透明度（rgba値）
- コンテンツパネルの背景色と透明度

### テキスト
- 文字色（カラーコード）
- 配置（left/center/right、top/center/bottom）
- フォントサイズ（見出し・本文）
- 行間、文字間隔

### 形状・境界
- Border radius（角丸の程度）
- Border color/width
- Box shadow

### レイアウト・配置
- コンテンツの配置方法（絶対位置/相対位置）
- 中央配置の有無と方法
- Padding、Margin（視覚的な余白をpxで）
- 要素の重なり順序（z-index）

### インタラクティブ要素
- ナビゲーション矢印/ボタンの形状
- 背景色（透明度含む）
- アイコン色
- サイズ（幅x高さ）
- 配置位置

### インジケーター
- ドット/バーの形状
- アクティブ色
- 非アクティブ色（透明度含む）
- サイズ、間隔
- 配置位置

## 3. CSS生成ルール

### 重要な原則
✅ **透明度を正確に**：`rgba(0, 0, 0, 0.6)` のように数値で指定
✅ **配置を正確に**：中央配置なら `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`
✅ **既存のCSSを拡張**：既にあるスタイルは残し、追加/上書きのみ
✅ **デザイントークン優先**：`var(--color-xxx)` が使えるなら使う
✅ **コメントで説明**：なぜそのスタイルを適用したか（例：`/* 画像から検出: 半透明黒オーバーレイ */`）

### 出力するCSS

blocks/carousel/carousel.css を更新してください。

例：
```css
/* 画像から検出: 半透明黒のコンテンツパネル */
.carousel .carousel-content-panel {
  position: absolute;
  top: 50%; /* 画像から検出: 垂直中央 */
  left: 50%; /* 画像から検出: 水平中央 */
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6); /* 画像から検出: 黒60%透過 */
  padding: 40px 100px; /* 画像から検出: 余白 */
  max-width: 60%; /* 画像から検出: ビューポートの約60% */
}

/* 画像から検出: 白いテキスト、中央揃え */
.carousel .carousel-content-panel h2 {
  color: #ffffff; /* 画像から検出: 白文字 */
  font-size: 48px;
  text-align: center; /* 画像から検出: 中央揃え */
  margin-bottom: 24px;
}

.carousel .carousel-content-panel p {
  color: #ffffff; /* 画像から検出: 白文字 */
  font-size: 18px;
  text-align: center; /* 画像から検出: 中央揃え */
}

/* 画像から検出: 半透明のナビゲーション矢印 */
.carousel .carousel-navigation button {
  background-color: rgba(0, 0, 0, 0.3); /* 画像から検出: 黒30%透過 */
  color: #ffffff; /* 画像から検出: 白アイコン */
  width: 60px;
  height: 120px;
  border: none;
  border-radius: 0px; /* 画像から検出: 角丸なし */
}

/* 画像から検出: 白ドットインジケーター */
.carousel .carousel-indicators button {
  width: 16px; /* 画像から検出 */
  height: 16px; /* 画像から検出 */
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5); /* 画像から検出: 白50%透過（非アクティブ） */
  border: none;
  margin: 0 8px; /* 画像から検出: 間隔 */
}

.carousel .carousel-indicators button.active {
  background-color: #ffffff; /* 画像から検出: 白（アクティブ） */
}
```

## 4. HTML構造の確認

必要に応じて、carousel.js の decorate 関数を修正してください。

- コンテンツパネル用の要素が必要か？
- ナビゲーション矢印の構造は適切か？
- インジケーターの構造は適切か？

**EDS Block構造を維持**：
- Block > Rows > Cells の構造は変更しない
- decorateは既存のHTML（table由来）を変換するだけ

## 5. Storybook Storyの更新

必要に応じて、carousel.stories.js を更新してください。

- 新しいVariantに対応するStoryを追加
- 既存のStoryのコンテンツを調整

## 6. 実行後のアクション

生成後、以下を実行して検証してください：

```bash
# Storybookで目視確認
npm run storybook

# Visual差異を検証
npm run validate-block -- --block=carousel
```

---

# 🎯 重要なポイント

## 画像をよく観察
- 色の濃さ、透明度を正確に読み取る
- 余白（padding/margin）の大きさを推定
- 要素のサイズ比率を把握
- 配置（左右中央、上下中央）を確認

## 既存コードとの統合
- 既存のCSSクラス名を使う
- 既存のHTML構造を壊さない
- 追加・上書きのみで対応

## コメントで根拠を明示
- なぜそのスタイルを適用したか
- 画像から何を読み取ったか
- 既存コードをどう変更したか

---

# ✅ チェックリスト

生成後、以下を確認してください：

- [ ] 背景色・透明度が画像と一致しているか
- [ ] テキスト色・配置が画像と一致しているか
- [ ] ナビゲーション要素のスタイルが画像と一致しているか
- [ ] インジケーターのスタイルが画像と一致しているか
- [ ] 余白（padding/margin）が適切か
- [ ] z-indexによる重なり順序が正しいか
- [ ] Storybookで表示できるか
- [ ] Visual差異が改善されたか（validate-block実行）

---

# 📊 期待される結果

- **CSS更新**: blocks/carousel/carousel.css
- **HTML更新**（必要な場合）: blocks/carousel/carousel.js
- **Story更新**（必要な場合）: blocks/carousel/carousel.stories.js
- **Visual差異**: 50-60% → 10-15% に改善

---

# 🚀 実行例

```
Cursor Composer に以下を入力：

[添付画像: blocks/carousel/figma-variant-9392-204.png]

このFigma Carouselスクリーンショットを見て、視覚的に一致するCSSを生成してください。

現在の実装:
- blocks/carousel/carousel.css
- blocks/carousel/carousel.js
- blocks/carousel/carousel.stories.js

画像から読み取るべき詳細:
- 背景オーバーレイの透明度
- テキスト色・配置
- ナビゲーション矢印のスタイル
- インジケーターのスタイル
- レイアウト・余白

既存のCSSを拡張して、画像と一致するように更新してください。
コメントで「画像から検出」として根拠を明示してください。
```

→ AIが直接CSS/HTMLを生成 → 完了！
```

---

## 💡 ワンステップ生成のメリット

✅ **中間ステップ不要**：JSON解析→CSS変換の2段階が1段階に  
✅ **高速**：1回のプロンプトで完結  
✅ **柔軟**：AIが画像と既存コードを見て最適な実装を判断  
✅ **コンテキスト理解**：既存コードとの整合性を保ちやすい

---

## ⚠️ 注意点

- 精度は解析JSONステップ版より**やや低い可能性**あり
- AIが推測を含む可能性がある
- 生成後の目視確認・検証が重要
- 初回生成で完璧にならない場合は、追加指示で微調整

---

## 🔄 フィードバックループ

生成後、Visual差異が大きい場合：

1. **validate-block実行**で差異を確認
2. **具体的な修正指示**をCursorに追加：
   ```
   validate-blockの結果、以下の差異があります：
   - 背景オーバーレイがまだ明るすぎる → もっと暗く（rgba(0,0,0,0.7)に）
   - テキストが左寄せになっている → 中央揃えに修正
   
   これらを修正してください。
   ```

3. **再検証**：`npm run validate-block`

---

## 🎯 成功の鍵

1. **画像を必ず添付**
2. **既存ファイルパスを明示**
3. **コメントで根拠を要求**
4. **生成後すぐに検証**
5. **差異があれば具体的に指示して再生成**
