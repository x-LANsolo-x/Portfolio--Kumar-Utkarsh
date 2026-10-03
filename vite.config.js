import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        okx: resolve(__dirname, 'okx.html'),
        pangeam: resolve(__dirname, 'pangeam.html'),
        keyword: resolve(__dirname, 'keyword.html'),
        globaltrack: resolve(__dirname, 'globaltrack.html'),
        lumus: resolve(__dirname, 'lumus-ai.html'),
        payhoa: resolve(__dirname, 'payhoa.html')
      }
    }
  }
});
