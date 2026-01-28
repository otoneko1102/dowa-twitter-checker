# Dowa Twitter Checker

Chrome 拡張機能 (Vite でビルド)

- dowa の `contains` を使って、Twitter のツイートに「冷笑」が含まれているかを判定します
- 冷笑が含まれているときのみ、ツイート下部に **⚠️ 冷笑が含まれています！** を表示します

## 開発手順

1. 依存をインストール

   npm install

2. 開発サーバ (ホットリロード不要ですが vite を使ってビルド確認)

   npm run dev

3. ビルド

   - Chrome 用 (既定):

     npm run build

   - Build (both Chrome & Firefox, single command):

     npm run build

4. Chrome で拡張機能管理画面を開き、`dist/chrome` フォルダを「パッケージ化されていない拡張機能を読み込む」で読み込みます

   Firefox では一時的なアドオンとして読み込みます (2 通りあります):

   - `about:debugging` → 「This Firefox」→ 「Load Temporary Add-on...」→ `dist/firefox/manifest.json` を選択（ソースとなるフォルダを直接読み込む方法）
   - 生成された XPI を読み込む: `dist/dowa_twitter_checker-1.0.0.xpi` を選択（`npm run build` が自動で XPI を作成します）

Note: `npm run build` now creates:

- `dist/chrome/` and `dist/chrome.zip`
- `dist/firefox/`, `dist/firefox.zip`, and `dist/dowa_twitter_checker-1.0.0.xpi`

The Firefox manifest includes `browser_specific_settings.gecko.data_collection_permissions` set to `required: ["none"]` since this extension does not collect external data. Adjust `strict_min_version` if you need to target older Firefox versions.

注意: Twitter の DOM は頻繁に変わるため、必要に応じて `src/content.ts` のセレクタを調整してください。