import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Shim __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: resolve(__dirname, 'node_modules/process/browser.js'), 
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      assert: 'assert',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {}, 
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'util', 'stream-browserify', 'assert'],
  },
});
