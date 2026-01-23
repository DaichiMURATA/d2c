# Vision AI - Block Generation Analysis Prompt

このプロンプトをCursor Composer/Chatで使用して、Figmaスクリーンショットから視覚的詳細を抽出し、CSS生成に活用します。

---

## 🎯 目的

Figma Variantのスクリーンショットを解析し、**視覚的な詳細**（色、透明度、配置、形状など）を抽出してJSON形式で保存する。このJSONは後続のCSS生成プロセスで使用されます。

---

## 📋 使い方

### Step 1: スクリーンショット取得

```bash
npm run capture-figma-variant -- --block=carousel --node-id=9392:121
```

**出力**: `blocks/carousel/figma-variant-9392-121.png`

### Step 2: Cursorでこのプロンプトを使用

1. Cursor Composer (Cmd+I / Ctrl+I) を開く
2. `blocks/carousel/figma-variant-9392-121.png` を添付
3. 以下のプロンプトを実行

---

## 🔍 解析プロンプト（Cursor用）

```
以下のFigma Carouselコンポーネントのスクリーンショットを解析して、
CSS生成に必要な視覚的詳細をJSON形式で抽出してください。

# 解析対象の画像
blocks/carousel/figma-variant-9392-121.png

# 解析項目

## 1. 背景・オーバーレイ
- **背景色**: 透明度を含むカラーコード（例: rgba(0, 0, 0, 0.6)）
- **背景画像**: 有無、配置方法
- **オーバーレイ**: 画像の上に重なる暗い/明るいレイヤーの有無と透明度

## 2. テキスト
- **文字色**: カラーコード（例: #ffffff）
- **水平配置**: left / center / right
- **垂直配置**: top / center / bottom
- **テキストシャドウ**: 有無、色、ぼかし量
- **テキストアウトライン**: 有無

## 3. 形状・境界
- **Border Radius**: 角丸の半径（px）
- **Border**: 色、太さ（px）
- **Box Shadow**: 色、ぼかし、広がり、位置

## 4. レイアウト・配置
- **コンテンツ配置**: 絶対位置（absolute）か相対位置（relative）か
- **中央配置**: 左右中央、上下中央の有無
- **Padding**: 上下左右の余白（px単位で推定）
- **要素の重なり**: z-indexが必要な要素

## 5. インタラクティブ要素（ボタン、矢印など）
- **形状**: 正方形 / 長方形 / 円形 / 角丸正方形
- **背景色**: 透明度を含むカラーコード
- **アイコン色**: カラーコード
- **サイズ**: 幅x高さ（px）
- **配置**: 画面上の位置（left/right/center, top/bottom/center）
- **Border Radius**: 角丸の半径（px）

## 6. インジケーター（ドット、バーなど）
- **アクティブ色**: カラーコード
- **非アクティブ色**: 透明度を含むカラーコード
- **サイズ**: 直径/幅x高さ（px）
- **間隔**: 要素間の距離（px）
- **配置**: 画面上の位置

# 出力形式

以下のJSON形式で出力してください。**必ず数値には単位（px、%など）を付けてください。**

{
  "component": "carousel",
  "variantId": "9392:121",
  "variantName": "Multiple Slides No Content",
  "visualDetails": {
    "background": {
      "type": "image" | "solid" | "gradient",
      "color": "rgba(...) または #...",
      "overlayColor": "rgba(...)",
      "overlayOpacity": "0.6"
    },
    "contentPanel": {
      "backgroundColor": "rgba(0, 0, 0, 0.6)",
      "position": "absolute-center" | "top-left" | ...,
      "padding": {
        "top": "40px",
        "right": "60px",
        "bottom": "40px",
        "left": "60px"
      },
      "borderRadius": "0px",
      "boxShadow": "none" | "0 4px 6px rgba(0,0,0,0.1)"
    },
    "text": {
      "color": "#ffffff",
      "horizontalAlignment": "center" | "left" | "right",
      "verticalAlignment": "center" | "top" | "bottom",
      "textShadow": "0 2px 4px rgba(0,0,0,0.5)" | "none",
      "textOutline": "none" | "1px solid #000"
    },
    "navigationArrows": {
      "shape": "rounded-square" | "square" | "circle",
      "backgroundColor": "rgba(0, 0, 0, 0.5)",
      "iconColor": "#ffffff",
      "size": {
        "width": "48px",
        "height": "48px"
      },
      "borderRadius": "8px",
      "position": "sides-center" | "top-corners" | ...,
      "boxShadow": "none" | "..."
    },
    "indicators": {
      "type": "dots" | "bars",
      "activeColor": "#ffffff",
      "inactiveColor": "rgba(255, 255, 255, 0.5)",
      "size": {
        "width": "12px",
        "height": "12px"
      },
      "spacing": "8px",
      "position": "bottom-center" | "bottom-left" | ...,
      "marginBottom": "20px"
    }
  }
}

# 解析後のアクション

解析結果のJSONを以下のパスに保存してください：
blocks/carousel/vision-analysis-9392-121.json

その後、以下のコマンドでCSS生成に進みます：
npm run generate-css-with-vision -- --block=carousel --node-id=9392:121
```

---

## 💡 解析のポイント

### 透明度の検出
- 背景や要素が「透けている」場合、透明度を推定
- 例：黒い半透明オーバーレイ → `rgba(0, 0, 0, 0.6)`

### 配置の推定
- 要素が画面中央にある → `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)`
- 要素が端にある → `position: absolute; left: 20px; top: 20px`

### 形状の認識
- 正方形で角が丸い → `border-radius: 8px`
- 完全な円 → `border-radius: 50%`
- 長方形 → `border-radius: 4px` または `0px`

### 色の抽出
- 背景色：画像の背景部分の色を抽出
- テキスト色：テキストの色を抽出
- 対比を考慮：暗い背景には明るいテキスト

### 余白の推定
- 要素の端と内容の間の空間を測定
- 視覚的に推定して px 単位で記載

---

## 🎨 実行例（Carousel）

### 入力画像の特徴
- 靴の画像が背景
- 中央に黒い半透明パネル
- 白い見出しとテキスト
- 左右に黒い半透明の矢印ボタン（角丸）
- 下部中央に白いドットインジケーター

### 期待される出力

```json
{
  "component": "carousel",
  "variantId": "9392:121",
  "variantName": "Multiple Slides No Content",
  "visualDetails": {
    "background": {
      "type": "image",
      "overlayColor": "transparent"
    },
    "contentPanel": {
      "backgroundColor": "rgba(0, 0, 0, 0.6)",
      "position": "absolute-center",
      "padding": {
        "top": "40px",
        "right": "60px",
        "bottom": "40px",
        "left": "60px"
      },
      "borderRadius": "0px",
      "boxShadow": "none"
    },
    "text": {
      "color": "#ffffff",
      "horizontalAlignment": "center",
      "verticalAlignment": "center",
      "textShadow": "none",
      "textOutline": "none"
    },
    "navigationArrows": {
      "shape": "rounded-square",
      "backgroundColor": "rgba(0, 0, 0, 0.5)",
      "iconColor": "#ffffff",
      "size": {
        "width": "48px",
        "height": "48px"
      },
      "borderRadius": "8px",
      "position": "sides-center",
      "boxShadow": "none"
    },
    "indicators": {
      "type": "dots",
      "activeColor": "#ffffff",
      "inactiveColor": "rgba(255, 255, 255, 0.5)",
      "size": {
        "width": "12px",
        "height": "12px"
      },
      "spacing": "8px",
      "position": "bottom-center",
      "marginBottom": "20px"
    }
  }
}
```

---

## 🔄 ワークフロー全体

```
1. Figmaスクリーンショット取得
   npm run capture-figma-variant -- --block=carousel --node-id=9392:121
   ↓
   blocks/carousel/figma-variant-9392-121.png 生成

2. Cursorで画像解析（このプロンプト使用）
   ↓
   blocks/carousel/vision-analysis-9392-121.json 生成

3. CSS生成（Vision結果を統合）
   npm run generate-css-with-vision -- --block=carousel --node-id=9392:121
   ↓
   blocks/carousel/carousel.css 生成（高精度）

4. 検証
   npm run validate-block -- --block=carousel
   ↓
   視覚的差異が大幅に改善（50% → 10-15%）
```

---

## 📝 注意事項

- **Cursorで実行**: このプロンプトは外部API呼び出しではなく、Cursor内で実行します
- **画像添付必須**: 必ずFigmaスクリーンショットを添付してください
- **JSON保存**: 解析結果は必ず指定されたパスに保存してください
- **単位を明記**: すべての数値には単位（px、%など）を付けてください
- **透明度に注意**: `rgba()` 形式で透明度を正確に記載してください

---

## 🎯 成功基準

- ✅ 背景色と透明度が正確に抽出されている
- ✅ テキスト色と配置が正確に抽出されている
- ✅ インタラクティブ要素（ボタン、矢印）のスタイルが正確
- ✅ レイアウト（中央配置など）が正確に推定されている
- ✅ JSON形式が正しく、すべての単位が明記されている
