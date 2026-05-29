import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // ── Plugins ────────────────────────────────────────────────────
  plugins: [react()],

  // ── Path aliases ───────────────────────────────────────────────
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ── Dev server ─────────────────────────────────────────────────
  server: {
    port: 5173,
    strictPort: false,
  },

  // ── Preview server (npm run preview) ──────────────────────────
  preview: {
    port: 4173,
    strictPort: false,
  },

  // ── Production build ───────────────────────────────────────────
  build: {
    // Output directory (default: dist) — matches Vercel's expectation
    outDir: 'dist',

    // Raise chunk warning threshold slightly; recharts + framer-motion are large
    // by design. Splitting them into their own chunks (see below) handles this.
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        /**
         * manualChunks — splits vendor libraries into separate cache-busted files.
         *
         * Benefits:
         *   - Returning users only re-download chunks that actually changed.
         *   - App code changes don't bust the vendor cache.
         *   - Vercel CDN can cache vendor chunks for 1 year (immutable in vercel.json).
         *
         * Strategy:
         *   vendor-react   — stable React runtime (changes rarely)
         *   vendor-state   — Zustand + Axios (changes rarely)
         *   vendor-form    — react-hook-form + zod (changes rarely)
         *   vendor-charts  — recharts (~120 KB gzipped; separated for independent caching)
         *   vendor-motion  — framer-motion (~60 KB gzipped; separated for independent caching)
         *   [app code]     — everything else (changes on every deploy)
         */
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-state':  ['zustand', 'axios'],
          'vendor-form':   ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
