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
         * Written as a function (not an object) to satisfy Rollup's strict
         * ManualChunksFunction type under Vite 8 / TypeScript 6.
         *
         * The object-literal form is accepted at runtime but the Rollup type
         * definition expects either a function or undefined for the `output`
         * variant used here, causing a tsc type error on the object literal.
         *
         * Benefits:
         *   - Returning users only re-download chunks that actually changed.
         *   - App code changes don't bust the vendor cache.
         *   - Vercel CDN can cache vendor chunks for 1 year (immutable in vercel.json).
         *
         * Strategy:
         *   vendor-react   — stable React runtime (changes rarely)
         *   vendor-state   — Zustand + Axios (changes rarely)
         *   vendor-form    — react-hook-form + zod + resolvers (changes rarely)
         *   vendor-charts  — recharts (~120 KB gzipped; separated for independent caching)
         *   vendor-motion  — framer-motion (~60 KB gzipped; separated for independent caching)
         *   [default]      — everything else (app code; changes on every deploy)
         */
        manualChunks(id: string): string | undefined {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/')
          ) {
            return 'vendor-react'
          }
          if (
            id.includes('node_modules/zustand/') ||
            id.includes('node_modules/axios/')
          ) {
            return 'vendor-state'
          }
          if (
            id.includes('node_modules/react-hook-form/') ||
            id.includes('node_modules/@hookform/') ||
            id.includes('node_modules/zod/')
          ) {
            return 'vendor-form'
          }
          if (id.includes('node_modules/recharts/')) {
            return 'vendor-charts'
          }
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion'
          }
          // Everything else (app code + unlisted deps) uses Rollup's default chunking
          return undefined
        },
      },
    },
  },
})
