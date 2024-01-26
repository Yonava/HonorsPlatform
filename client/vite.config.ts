import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: {
    alias: {
      '@/': '/src/',
      '@store': '/src/store',
      '@components': '/src/components',
      '@panels': '/src/Panels.ts',
      '@locals': '/src/Locals.ts',
      '@composables': '/src/composables',
      '@utils': '/src/utils',
      '@apptypes': '/src/types',
    }
  },
  plugins: [vue()],
  build: {
    outDir: '../server/public'
  },
  server: {
    port: 5177,
    proxy: {
      '/api': {
        target: 'http://localhost:1010',
        changeOrigin: true
      }
    }
  }
})
