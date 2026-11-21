import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    cssCodeSplit: false, // Fix for html-inline-proxy error
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.trycloudflare.com']
  }
});
