import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { localSavePlugin } from './vite-local-save-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), localSavePlugin()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
