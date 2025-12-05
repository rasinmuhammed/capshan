import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'transformers': ['@xenova/transformers'],
          'ffmpeg': ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
          'audio': ['wavesurfer.js'],
        },
      },
    },
  },
})
