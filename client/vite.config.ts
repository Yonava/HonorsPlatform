import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
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
