/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    // Storybook iframe layout settings for pixel-perfect screenshot comparison
    layout: 'fullscreen',
    
    // アクセシビリティテストのデフォルト設定
    a11y: {
      config: {
        rules: [
          {
            // WCAG 2.1 Level AA 準拠
            id: 'color-contrast',
            enabled: true,
          },
          {
            // ARIA 属性の検証
            id: 'aria-*',
            enabled: true,
          },
          {
            // キーボードナビゲーション
            id: 'keyboard',
            enabled: true,
          },
        ],
      },
      // 違反を自動的に検出してハイライト
      // Storybook 9.x では 'element' → 'context' に変更
      context: '#storybook-root',
      manual: false,
    },
    
    // アクション（イベントログ）
    actions: { argTypesRegex: '^on[A-Z].*' },
    
    // コントロール（Props の編集）
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    
    // ドキュメント生成
    docs: {
      toc: true,
    },
    
    // Chromatic 設定
    chromatic: {
      // アクセシビリティ違反があってもスナップショットを撮影
      disableSnapshot: false,
      // 遅延読み込みの待機時間
      delay: 300,
    },
  },
};

export default preview;
