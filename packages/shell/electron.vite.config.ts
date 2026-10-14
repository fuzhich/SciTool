import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@scitool/sdk'] })]
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@scitool/sdk'] })],
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/preload/index.ts'),
          'app-preload': resolve('src/preload/app-preload.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
