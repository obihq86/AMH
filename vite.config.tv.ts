import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';

// পুরোনো স্মার্ট টিভি / TV-box-এর (HiSilicon Hi3521 ইত্যাদি) নিজস্ব ব্রাউজার লক্ষ্য করে আলাদা বিল্ড।
// মূল বিল্ড ES-module + নতুন CSS ফিচার নিয়ে তৈরি — পুরোনো ব্রাউজারে (Chrome <61) module-ই লোড হয় না,
// ফলে পাতা সম্পূর্ণ খালি। এখানে plugin-legacy দিয়ে নন-মডিউল (SystemJS + core-js) ফলব্যাক যোগ করা হয়,
// যাতে Chrome 49+/Android 4.4+ ব্রাউজারেও বোর্ড চলে; আধুনিক ব্রাউজার তবুও দ্রুত modern path পায়।
// CSS আলাদাভাবে tools/tv-compat.mjs দিয়ে Chromium 79-এরও আগের ভাষায় নামানো হয়।
export default defineConfig({
  base: '/tv/',
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      targets: ['chrome >= 49', 'android >= 4.4', 'and_chr >= 49', 'safari >= 10', 'firefox >= 45'],
      polyfills: true,
      renderModernChunks: true,
      modernPolyfills: false
    })
  ],
  build: {
    outDir: 'dist-tv',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react']
        }
      }
    }
  }
});
