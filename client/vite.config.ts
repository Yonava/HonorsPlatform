import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../server/public'
  },
  server: {
    port: 5178,
    proxy: {
      '/api': {
        target: 'http://localhost:1020',
        changeOrigin: true
      }
    }
  }
})
