import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    headers: {
      // Explicitly disable COEP to allow Google Apps Script and OAuth requests
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
    proxy: {
      // Proxy for Google Apps Script to avoid COEP issues
      '/api/log': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/log/, '/macros/s/AKfycbx-yMaLISDDgaTdxSkDsZdf0WKm9hxv0s5SkQQpo4ceF_qRkh2zX6gHlYfACxqWVQaa/exec'),
        followRedirects: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})