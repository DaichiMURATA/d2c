/**
 * Chromatic Visual Regression Test for d2c
 *
 * このテストは chromatic-pages.config.json の設定に基づいて動的に生成されます。
 * テスト対象ページを追加・削除する場合は、設定ファイルを編集してください。
 */

import { test, takeSnapshot } from '@chromatic-com/playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 現在のファイルのディレクトリを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 設定ファイルを読み込む
const configPath = join(__dirname, '..', 'chromatic-pages.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

// 環境変数でbaseURLを上書き可能
const baseURL = process.env.SOURCE_URL || config.baseUrl;

test.describe('d2c Visual Regression', () => {
  // 設定ファイルの各ページに対してテストを生成
  for (const pageConfig of config.pages) {
    for (const viewport of pageConfig.viewports) {
      const testName = `${pageConfig.name} - ${viewport.name}`;

      test(testName, async ({ page }, testInfo) => {
        // ビューポートを設定
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // ページに移動
        const fullUrl = `${baseURL}${pageConfig.path}`;
        console.log(`📱 Navigating to: ${fullUrl} (${viewport.width}x${viewport.height})`);

        const navigationOptions = {
          timeout: 30000,
        };

        if (pageConfig.waitForNetworkIdle) {
          navigationOptions.waitUntil = 'networkidle';
        }

        await page.goto(fullUrl, navigationOptions);

        // 追加の待機時間
        if (pageConfig.additionalWaitTime) {
          await page.waitForTimeout(pageConfig.additionalWaitTime);
        }

        console.log('📸 Taking Chromatic snapshot...');

        // Chromaticスナップショットを取得
        const snapshotName = `${pageConfig.name}-${viewport.name}`;
        await takeSnapshot(page, snapshotName, testInfo);

        console.log(`✅ Chromatic snapshot captured: ${snapshotName}`);
      });
    }
  }
});
