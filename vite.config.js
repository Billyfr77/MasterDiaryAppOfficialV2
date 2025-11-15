import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
    hmr: {
      overlay: true, // Show error overlay on HMR failures
    },
    watch: {
      usePolling: false, // Use native file watching for better performance
      interval: 100, // Check for changes every 100ms
    },
  },
  build: {
    rollupOptions: {
      input: 'index.html'
    }
  }
});