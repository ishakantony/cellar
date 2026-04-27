import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@cellar/shared': path.resolve(dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5200,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5201',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://localhost:5201',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
