import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';

// Use TARGET env var ("chrome" | "firefox"). Default is chrome.
const target = process.env.TARGET || 'chrome';
const manifest = target === 'firefox' ? require('./src/manifest.firefox.json') : require('./src/manifest.json');
const outDir = target === 'firefox' ? 'dist/firefox' : 'dist/chrome';

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    outDir
  }
});
