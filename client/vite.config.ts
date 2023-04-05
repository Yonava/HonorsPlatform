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
        target: 'https://honors.herokuapp.com',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

// const defaultConfig = {
//   plugins: [vue()],
//   port: 5177,
//   build: {
//     outDir: '../server/public',
//   },
// }

// export default defineConfig(({ command, mode }) => {
//   const devEnv = mode === 'development'
//   const target = devEnv ? 'http://localhost:1010' : 'https://honors.herokuapp.com'
//   return {
//     ...defaultConfig,
//     server: {
//       proxy: {
//         '/api': {
//           target: 'https://honors.herokuapp.com',
//           changeOrigin: devEnv,
//           secure: !devEnv,
//           rewrite: (path) => path.replace(/^\/api/, '')
//         }
//       }
//     },
//   }
// })
