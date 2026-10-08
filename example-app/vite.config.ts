import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'assets',
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
