import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// https://vite.dev/config/
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@assets': path.resolve(__dirname, './src/modules/user/assets'),
      '@': path.resolve(__dirname, './src')
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          // ── React Core — react + react-dom + scheduler ONLY (not router) ──
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor';
          }

          // ── React Router — separate chunk for router-only updates ──
          if (id.includes('react-router-dom') || id.includes('react-router/')) {
            return 'router-vendor';
          }

          // ── TanStack Query ──
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }

          // ── Animation libraries ──
          if (id.includes('framer-motion') || id.includes('gsap') || id.includes('@studio-freight/lenis')) {
            return 'motion-vendor';
          }

          // ── lucide-react — put in its own chunk for independent long-term caching ──
          // It's large (~400KB minified) but rarely changes version.
          // react-hot-toast is small but also benefits from being split out.
          if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
            return 'ui-vendor';
          }

          // ── Admin-only: recharts (~300KB), only used in admin dashboard ──
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'admin-charts';
          }

          // ── Firebase — auth only, split from main vendor ──
          if (id.includes('firebase') || id.includes('@firebase')) {
            return 'firebase-vendor';
          }

          // ── Scanner (QR — admin/scanner page only) ──
          if (id.includes('html5-qrcode') || id.includes('zbar')) {
            return 'scanner-vendor';
          }

          // ── Rich text editor — admin only ──
          if (id.includes('react-quill') || id.includes('quill')) {
            return 'editor-vendor';
          }

          // ── Socket.io-client — only needed for authenticated users ──
          // Kept separate so it's not in the critical storefront path
          if (id.includes('socket.io-client') || id.includes('socket.io-parser') || id.includes('engine.io-client')) {
            return 'socket-vendor';
          }

          // ── Barcode generator — admin/product editor only ──
          if (id.includes('react-barcode') || id.includes('jsbarcode')) {
            return 'barcode-vendor';
          }

          // ── DOMPurify — sanitization lib ──
          if (id.includes('dompurify')) {
            return 'sanitize-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});