import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Output as a single bundle for embedding
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IntraMind',
      fileName: 'intramind-widget',
      formats: ['iife'], // Self-executing function for script tag
    },
    // Inline CSS into JS bundle
    cssCodeSplit: false,
    // Optimize bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
    // Source maps (external for debugging)
    sourcemap: true,
  },
})

