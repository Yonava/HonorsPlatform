import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const defaultConfig = {
  plugins: [vue()],
  port: 5177,
  build: {
    outDir: '../server/public',
  },
}

export default defineConfig(({ command, mode }) => {
  const devEnv = mode === 'development'
  const target = devEnv ? 'http://localhost:1010' : 'https://honors.herokuapp.com'
  console.log(devEnv)
  return {
    ...defaultConfig,
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: devEnv,
          secure: !devEnv,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
  }
})
